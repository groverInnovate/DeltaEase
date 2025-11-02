// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockUniswapRouter
 * @dev Mock implementation of Uniswap V3 Router for testing delta-neutral strategies
 */
contract MockUniswapRouter {
    uint256 public constant USDC_TO_ETH_RATE = 5e14; // 0.0005 ETH per USDC
    
    event SwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address indexed recipient
    );
    
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
    
    function exactInputSingle(ExactInputSingleParams calldata params) 
        external 
        payable 
        returns (uint256 amountOut) 
    {
        require(params.deadline >= block.timestamp, "Transaction too old");
        require(params.amountIn > 0, "Invalid input amount");
        
        IERC20(params.tokenIn).transferFrom(msg.sender, address(this), params.amountIn);
        
        amountOut = (params.amountIn * USDC_TO_ETH_RATE) / 1e6;
        
        require(amountOut >= params.amountOutMinimum, "Insufficient output amount");
        require(address(this).balance >= amountOut, "Insufficient ETH liquidity");
        
        payable(params.recipient).transfer(amountOut);
        
        emit SwapExecuted(
            params.tokenIn,
            params.tokenOut,
            params.amountIn,
            amountOut,
            params.recipient
        );
        
        return amountOut;
    }
    
    function addETHLiquidity() external payable {
        // Allow anyone to add ETH liquidity for testing
    }
    
    function getAmountOut(uint256 amountIn) external pure returns (uint256 amountOut) {
        return (amountIn * USDC_TO_ETH_RATE) / 1e6;
    }
    
    receive() external payable {}
}