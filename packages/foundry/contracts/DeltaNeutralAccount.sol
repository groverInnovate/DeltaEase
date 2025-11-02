// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

interface IUniswapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

interface ILido {
    function submit(address _referral) external payable returns (uint256);
    function getPooledEthByShares(uint256 _sharesAmount) external view returns (uint256);
    function getSharesByPooledEth(uint256 _pooledEthAmount) external view returns (uint256);
}

interface IstETH {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IGMXRouter {
    struct CreateOrderParams {
        address[] addresses;
        uint256[] numbers;
        bytes32 orderType;
        bool isLong;
    }
    
    function createOrder(CreateOrderParams calldata params) external payable;
    function cancelOrder(bytes32 key) external;
    function getOrder(bytes32 key) external view returns (
        address account,
        uint256 sizeDelta,
        uint256 collateralDelta,
        bool isLong
    );
}

interface IERC20Permit {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}/**
 
* @title DeltaNeutralAccount
 * @dev ERC-4337 compliant smart contract account with ECDSA signature validation
 * and batch execution capabilities for delta-neutral DeFi strategies
 */
contract DeltaNeutralAccount is BaseAccount, Initializable {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    // State variables
    address public owner;
    IEntryPoint private immutable _entryPoint;
    uint256 private _nonce;
    
    // Strategy tracking
    struct StrategyPosition {
        uint256 initialUSDCAmount;
        uint256 stETHAmount;
        bytes32 gmxOrderKey;
        uint256 entryTimestamp;
        bool isActive;
    }
    
    StrategyPosition public currentPosition;
    
    // Session key management
    mapping(address => SessionKey) public sessionKeys;
    
    struct SessionKey {
        bool isActive;
        uint256 expiryTimestamp;
        bytes4[] allowedSelectors;
    }
    
    // Emergency controls
    bool public emergencyPaused;
    address public emergencyManager;
    
    // Events
    event AccountInitialized(IEntryPoint indexed entryPoint, address indexed owner);
    event BatchExecuted(address[] targets, uint256[] values, bytes[] data);
    event Received(address indexed sender, uint256 value);
    event StrategyEntered(uint256 usdcAmount, uint256 stETHAmount, bytes32 gmxOrderKey);
    event StrategyExited(uint256 finalUSDCAmount, uint256 profit);
    event SessionKeyAdded(address indexed sessionKey, uint256 expiry);
    event SessionKeyRevoked(address indexed sessionKey);
    event EmergencyPaused(address indexed caller);
    event EmergencyUnpaused(address indexed caller);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "DeltaNeutralAccount: caller is not the owner");
        _;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == address(_entryPoint), "DeltaNeutralAccount: not from EntryPoint");
        _;
    }
    
    modifier onlyOwnerOrSessionKey() {
        require(
            msg.sender == owner || _isValidSessionKey(msg.sender),
            "DeltaNeutralAccount: unauthorized caller"
        );
        _;
    }  
  
    modifier notPaused() {
        require(!emergencyPaused, "DeltaNeutralAccount: contract is paused");
        _;
    }
    
    modifier onlyEmergencyManager() {
        require(
            msg.sender == owner || msg.sender == emergencyManager,
            "DeltaNeutralAccount: not emergency manager"
        );
        _;
    }

    // Constructor sets the immutable entry point
    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
    }

    /**
     * @dev Initialize the account with an owner address
     */
    function initialize(address _ownerAddress) public initializer {
        require(_ownerAddress != address(0), "DeltaNeutralAccount: owner cannot be zero");
        owner = _ownerAddress;
        emergencyManager = _ownerAddress;
        emit AccountInitialized(_entryPoint, _ownerAddress);
    }

    // ============ SESSION KEY MANAGEMENT ============
    
    function addSessionKey(
        address sessionKey,
        uint256 expiryTimestamp,
        bytes4[] calldata allowedSelectors
    ) external onlyOwner {
        require(sessionKey != address(0), "Invalid session key");
        require(expiryTimestamp > block.timestamp, "Invalid expiry");
        
        sessionKeys[sessionKey] = SessionKey({
            isActive: true,
            expiryTimestamp: expiryTimestamp,
            allowedSelectors: allowedSelectors
        });
        
        emit SessionKeyAdded(sessionKey, expiryTimestamp);
    }
    
    function revokeSessionKey(address sessionKey) external onlyOwner {
        sessionKeys[sessionKey].isActive = false;
        emit SessionKeyRevoked(sessionKey);
    }
    
    function _isValidSessionKey(address sessionKey) internal view returns (bool) {
        SessionKey memory key = sessionKeys[sessionKey];
        
        if (!key.isActive || block.timestamp > key.expiryTimestamp) {
            return false;
        }
        
        bytes4 selector = msg.sig;
        for (uint256 i = 0; i < key.allowedSelectors.length; i++) {
            if (key.allowedSelectors[i] == selector) {
                return true;
            }
        }
        
        return false;
    }

    // ============ EMERGENCY CONTROLS ============
    
    function emergencyPause() external onlyEmergencyManager {
        emergencyPaused = true;
        emit EmergencyPaused(msg.sender);
    }
    
    function emergencyUnpause() external onlyOwner {
        emergencyPaused = false;
        emit EmergencyUnpaused(msg.sender);
    }
    
    function setEmergencyManager(address newManager) external onlyOwner {
        emergencyManager = newManager;
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }

    // ============ BATCH EXECUTION ============
    
    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external onlyOwnerOrSessionKey notPaused {
        require(
            dest.length == func.length && dest.length == value.length,
            "DeltaNeutralAccount: wrong array lengths"
        );

        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], value[i], func[i]);
        }

        emit BatchExecuted(dest, value, func);
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external override onlyOwner {
        _call(target, value, data);
    }

    function _call(
        address target,
        uint256 value,
        bytes memory data
    ) internal {
        (bool success, ) = target.call{value: value}(data);
        require(success, "DeltaNeutralAccount: execution failed");
    }

    // ============ ERC-4337 FUNCTIONS ============
    
    function executeUserOp(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func,
        uint256 nonce,
        bytes calldata /* signature */
    ) external onlyEntryPoint {
        require(
            dest.length == func.length && dest.length == value.length,
            "DeltaNeutralAccount: wrong array lengths"
        );
        
        require(nonce == _nonce, "DeltaNeutralAccount: invalid nonce");
        _incrementNonce();

        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], value[i], func[i]);
        }
    }

    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        require(msg.sender == address(_entryPoint), "DeltaNeutralAccount: not from EntryPoint");
        
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", userOpHash));
        address recovered = ECDSA.recover(hash, userOp.signature);
        require(recovered == owner, "DeltaNeutralAccount: invalid signature");
        
        if (missingAccountFunds > 0) {
            _payPrefund(missingAccountFunds);
        }
        
        return 0;
    }

    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256) {
        bytes32 hash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", userOpHash));
        address recovered = ECDSA.recover(hash, userOp.signature);
        
        if (recovered != owner) {
            return 1;
        }
        
        return 0;
    }

    function _payPrefund(uint256 missingAccountFunds) internal override {
        if (missingAccountFunds == 0) return;
        
        (bool success,) = payable(msg.sender).call{
            value: missingAccountFunds,
            gas: type(uint256).max
        }("");
        require(success, "Failed to pay prefund");
    } 
   // ============ DELTA-NEUTRAL STRATEGY ============
    
    function executeDeltaNeutralStrategy(
        IERC20Permit usdc,
        address userEOA,
        uint256 amount,
        address uniswapRouter,
        address lido,
        address stETH,
        address gmxRouter,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s,
        IUniswapRouter.ExactInputSingleParams calldata uniswapParams,
        bytes calldata gmxOrderData
    ) external onlyOwnerOrSessionKey notPaused {
        require(!currentPosition.isActive, "Position already active");
        
        // Execute USDC approval and transfer
        _executeUSDCPermit(usdc, userEOA, amount, deadline, v, r, s);
        _executeUSDCTransferAndApprove(usdc, userEOA, amount, uniswapRouter);
        
        // Execute swap and stake
        _executeSwap(usdc, uniswapRouter, uniswapParams);
        uint256 stETHBalance = _executeStake(lido);
        
        // Execute GMX order
        _executeGMXApproval(stETH, gmxRouter);
        bytes32 orderKey = _executeGMXOrder(gmxRouter, gmxOrderData);
        
        // Track the position
        currentPosition = StrategyPosition({
            initialUSDCAmount: amount,
            stETHAmount: stETHBalance,
            gmxOrderKey: orderKey,
            entryTimestamp: block.timestamp,
            isActive: true
        });
        
        emit StrategyEntered(amount, stETHBalance, orderKey);
    }

    function _executeUSDCPermit(
        IERC20Permit usdc,
        address userEOA,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        _call(
            address(usdc),
            0,
            abi.encodeWithSelector(
                IERC20Permit.permit.selector,
                userEOA,
                address(this),
                amount,
                deadline,
                v, r, s
            )
        );
    }

    function _executeUSDCTransferAndApprove(
        IERC20Permit usdc,
        address userEOA,
        uint256 amount,
        address uniswapRouter
    ) internal {
        _call(
            address(usdc),
            0,
            abi.encodeWithSelector(
                IERC20.transferFrom.selector,
                userEOA,
                address(this),
                amount
            )
        );

        _call(
            address(usdc),
            0,
            abi.encodeWithSelector(
                IERC20.approve.selector,
                uniswapRouter,
                amount
            )
        );
    }

    function _executeSwap(
        IERC20Permit usdc,
        address uniswapRouter,
        IUniswapRouter.ExactInputSingleParams calldata uniswapParams
    ) internal {
        _call(
            uniswapRouter,
            0,
            abi.encodeWithSelector(
                IUniswapRouter.exactInputSingle.selector,
                uniswapParams
            )
        );
    }

    function _executeStake(address lido) internal returns (uint256) {
        uint256 ethBalance = address(this).balance;
        _call(
            lido,
            ethBalance,
            abi.encodeWithSignature("submit(address)", address(this))
        );
        return ethBalance;
    }

    function _executeGMXApproval(address stETH, address gmxRouter) internal {
        _call(
            stETH,
            0,
            abi.encodeWithSelector(
                IERC20.approve.selector,
                gmxRouter,
                type(uint256).max
            )
        );
    }

    function _executeGMXOrder(address gmxRouter, bytes calldata gmxOrderData) internal returns (bytes32) {
        _call(
            gmxRouter,
            0,
            gmxOrderData
        );
        return keccak256(abi.encodePacked(block.timestamp, address(this)));
    }

    // ============ EXIT STRATEGY ============
    
    function exitDeltaNeutralStrategy(
        address gmxRouter,
        address uniswapRouter,
        address lido,
        address stETH,
        address usdc,
        IUniswapRouter.ExactInputSingleParams calldata uniswapParams
    ) external onlyOwnerOrSessionKey notPaused {
        require(currentPosition.isActive, "No active position");
        
        // Close GMX position
        _closeGMXPosition(gmxRouter, currentPosition.gmxOrderKey);
        
        // Get stETH balance and swap back to USDC
        uint256 stETHBalance = IstETH(stETH).balanceOf(address(this));
        
        _call(
            stETH,
            0,
            abi.encodeWithSelector(
                IERC20.approve.selector,
                uniswapRouter,
                stETHBalance
            )
        );
        
        _call(
            uniswapRouter,
            0,
            abi.encodeWithSelector(
                IUniswapRouter.exactInputSingle.selector,
                uniswapParams
            )
        );
        
        // Calculate profit
        uint256 finalUSDCBalance = IERC20(usdc).balanceOf(address(this));
        uint256 profit = finalUSDCBalance > currentPosition.initialUSDCAmount 
            ? finalUSDCBalance - currentPosition.initialUSDCAmount 
            : 0;
        
        // Reset position
        currentPosition.isActive = false;
        
        emit StrategyExited(finalUSDCBalance, profit);
    }
    
    function _closeGMXPosition(address gmxRouter, bytes32 orderKey) internal {
        _call(
            gmxRouter,
            0,
            abi.encodeWithSelector(
                IGMXRouter.cancelOrder.selector,
                orderKey
            )
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getCurrentPosition() external view returns (StrategyPosition memory) {
        return currentPosition;
    }
    
    function getCurrentPositionValue(address stETH, address usdc) external view returns (uint256) {
        if (!currentPosition.isActive) return 0;
        
        uint256 stETHBalance = IstETH(stETH).balanceOf(address(this));
        uint256 usdcBalance = IERC20(usdc).balanceOf(address(this));
        
        return usdcBalance + stETHBalance;
    }

    function getNonce() public view override returns (uint256) {
        return _nonce;
    }

    function _incrementNonce() internal  {
        _nonce++;
    }

    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    // ============ UTILITY FUNCTIONS ============
    
    function permitToken(
        IERC20 token,
        address tokenOwner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyOwnerOrSessionKey notPaused {
        IERC20Permit(address(token)).permit(tokenOwner, spender, value, deadline, v, r, s);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}