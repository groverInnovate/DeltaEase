// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockLiquidStaking
 * @dev Mock implementation of Lido-like liquid staking for testing delta-neutral strategies
 */
contract MockLiquidStaking {
    MockstETH public immutable stETH;
    
    uint256 public constant ANNUAL_YIELD_RATE = 500; // 5% APY in basis points
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    mapping(address => uint256) public lastStakeTime;
    mapping(address => uint256) public stakedAmount;
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 ethAmount, uint256 stETHMinted);
    event YieldAccrued(address indexed user, uint256 yieldAmount);
    
    constructor() {
        stETH = new MockstETH();
    }
    
    function submit(address _referral) external payable returns (uint256) {
        require(msg.value > 0, "Must stake some ETH");
        
        _accrueYield(msg.sender);
        
        uint256 stETHAmount = msg.value;
        stETH.mint(msg.sender, stETHAmount);
        
        stakedAmount[msg.sender] += msg.value;
        totalStaked += msg.value;
        lastStakeTime[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, msg.value, stETHAmount);
        return stETHAmount;
    }
    
    function _accrueYield(address user) internal {
        if (stakedAmount[user] == 0 || lastStakeTime[user] == 0) return;
        
        uint256 timeElapsed = block.timestamp - lastStakeTime[user];
        if (timeElapsed == 0) return;
        
        uint256 yieldAmount = (stakedAmount[user] * ANNUAL_YIELD_RATE * timeElapsed) / 
                             (10000 * SECONDS_PER_YEAR);
        
        if (yieldAmount > 0) {
            stETH.mint(user, yieldAmount);
            emit YieldAccrued(user, yieldAmount);
        }
        
        lastStakeTime[user] = block.timestamp;
    }
    
    function accrueYield(address user) external {
        _accrueYield(user);
    }
    
    receive() external payable {}
}

contract MockstETH is ERC20 {
    address public immutable stakingContract;
    
    constructor() ERC20("Mock Liquid Staked Ether", "mockstETH") {
        stakingContract = msg.sender;
    }
    
    modifier onlyStakingContract() {
        require(msg.sender == stakingContract, "Only staking contract");
        _;
    }
    
    function mint(address to, uint256 amount) external onlyStakingContract {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyStakingContract {
        _burn(from, amount);
    }
}