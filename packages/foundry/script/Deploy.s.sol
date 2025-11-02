// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "..//contracts/DeltaNeutralAccountFactory.sol";
import "..//contracts/DeltaNeutralAccount.sol";
import "..//contracts/MockLiquidStaking.sol";
import "..//contracts/MockUniswapRouter.sol";
import "..//contracts/MockGMXRouter.sol";
import "..//contracts/YourContract.sol";

contract Deploy is ScaffoldETHDeploy {
    // EntryPoint address (same across all networks for ERC-4337)
    address constant ENTRY_POINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    
    function run() external ScaffoldEthDeployerRunner {
        // Deploy YourContract (for Scaffold-ETH compatibility)
        YourContract yourContract = new YourContract(deployer);
        console.log("YourContract deployed at:", address(yourContract));

        // Deploy Mock Contracts for testing
        MockLiquidStaking mockLido = new MockLiquidStaking();
        console.log("MockLiquidStaking deployed at:", address(mockLido));
        console.log("MockstETH deployed at:", address(mockLido.stETH()));

        MockUniswapRouter mockUniswap = new MockUniswapRouter();
        console.log("MockUniswapRouter deployed at:", address(mockUniswap));

        MockGMXRouter mockGMX = new MockGMXRouter();
        console.log("MockGMXRouter deployed at:", address(mockGMX));

        // Deploy a standalone DeltaNeutralAccount for frontend integration
        DeltaNeutralAccount deltaNeutralAccount = new DeltaNeutralAccount(
            IEntryPoint(ENTRY_POINT)
        );
        console.log("DeltaNeutralAccount deployed at:", address(deltaNeutralAccount));

        // Deploy the Delta-Neutral Account Factory
        DeltaNeutralAccountFactory factory = new DeltaNeutralAccountFactory(
            IEntryPoint(ENTRY_POINT)
        );
        console.log("DeltaNeutralAccountFactory deployed at:", address(factory));
        console.log("Account implementation deployed at:", factory.accountImplementation());

        // Create a test account for the deployer
        address testAccount = factory.createAccount(deployer, 0);
        console.log("Test DeltaNeutralAccount created at:", testAccount);

        // Fund mock contracts with some ETH for testing
        payable(address(mockUniswap)).transfer(0.1 ether);
        console.log("MockUniswapRouter funded with 0.1 ETH");

        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("YourContract:", address(yourContract));
        console.log("DeltaNeutralAccount:", address(deltaNeutralAccount));
        console.log("MockLido:", address(mockLido));
        console.log("MockstETH:", address(mockLido.stETH()));
        console.log("MockUniswap:", address(mockUniswap));
        console.log("MockGMX:", address(mockGMX));
        console.log("Factory:", address(factory));
        console.log("TestAccount:", testAccount);
        console.log("EntryPoint:", ENTRY_POINT);
    }
}