// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Simple mock USDC contract for testing - no permit needed, just mint directly
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6; // USDC has 6 decimals
    
    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**_decimals); // 1M USDC
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint USDC to any address - for testing purposes
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Mint USDC to caller - for easy testing
     */
    function mintToSelf(uint256 amount) external {
        _mint(msg.sender, amount);
    }
    
    /**
     * @dev Mint USDC to smart account directly - eliminates need for permits
     */
    function mintToAccount(address account, uint256 amount) external {
        _mint(account, amount);
    }
    
    /**
     * @dev Faucet function - anyone can get 100 USDC for testing
     */
    function faucet() external {
        require(balanceOf(msg.sender) < 1000 * 10**_decimals, "Already has enough USDC");
        _mint(msg.sender, 100 * 10**_decimals); // 100 USDC
    }
}