// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/DeltaNeutralAccountFactory.sol";
import "../contracts/DeltaNeutralAccount.sol";
import "../contracts/YourContract.sol";
import "../contracts/MockLiquidStaking.sol";
import "../contracts/MockUniswapRouter.sol";
import "../contracts/MockGMXRouter.sol";
import "../contracts/MockUSDC.sol";

contract DeployArbitrumSepolia is ScaffoldETHDeploy {
    // EntryPoint address (same across all networks for ERC-4337)
    address constant ENTRY_POINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    
    // Real Arbitrum Sepolia contract addresses  
    address constant WETH = 0x980B62Da83eFf3D4576C647993b0c1D7faf17c73; // WETH on Arbitrum Sepolia
    address constant UNISWAP_ROUTER = 0x101F443B4d1b059569D643917553c771E1b9663E; // Uniswap V3 Router
    
    // Note: Lido and GMX don't exist on Arbitrum Sepolia, we'll use placeholders for now
    // In production, you'd use Arbitrum-native liquid staking and perp protocols
    address constant LIDO_PLACEHOLDER = 0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F;
    address constant GMX_PLACEHOLDER = 0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8;
    
    function run() external ScaffoldEthDeployerRunner {
        console.log("Deploying to Arbitrum Sepolia...");
        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        // Deploy YourContract (for Scaffold-ETH compatibility)
        YourContract yourContract = new YourContract(deployer);
        console.log("YourContract deployed at:", address(yourContract));

        // Deploy Mock Contracts for testing
        MockUSDC mockUSDC = new MockUSDC();
        console.log("MockUSDC deployed at:", address(mockUSDC));

        MockLiquidStaking mockLido = new MockLiquidStaking();
        console.log("MockLiquidStaking deployed at:", address(mockLido));
        console.log("MockstETH deployed at:", address(mockLido.stETH()));

        MockUniswapRouter mockUniswap = new MockUniswapRouter();
        console.log("MockUniswapRouter deployed at:", address(mockUniswap));

        MockGMXRouter mockGMX = new MockGMXRouter();
        console.log("MockGMXRouter deployed at:", address(mockGMX));

        // Deploy the Delta-Neutral Account implementation
        DeltaNeutralAccount accountImplementation = new DeltaNeutralAccount(
            IEntryPoint(ENTRY_POINT)
        );
        console.log("DeltaNeutralAccount implementation deployed at:", address(accountImplementation));

        // Deploy the Delta-Neutral Account Factory
        DeltaNeutralAccountFactory factory = new DeltaNeutralAccountFactory(
            IEntryPoint(ENTRY_POINT)
        );
        console.log("DeltaNeutralAccountFactory deployed at:", address(factory));

        // Create a test account for the deployer
        address testAccount = factory.createAccount(deployer, 0);
        console.log("Test DeltaNeutralAccount created at:", testAccount);

        // Mock contracts deployed successfully

        console.log("\n=== ARBITRUM SEPOLIA DEPLOYMENT SUMMARY ===");
        console.log("Network: Arbitrum Sepolia (421614)");
        console.log("YourContract:", address(yourContract));
        console.log("DeltaNeutralAccount Implementation:", address(accountImplementation));
        console.log("DeltaNeutralAccountFactory:", address(factory));
        console.log("TestAccount:", testAccount);
        console.log("EntryPoint:", ENTRY_POINT);
        console.log("\n=== MOCK PROTOCOL ADDRESSES ===");
        console.log("MockUSDC:", address(mockUSDC));
        console.log("WETH (Real):", WETH);
        console.log("Uniswap Router (Real):", UNISWAP_ROUTER);
        console.log("MockLido:", address(mockLido));
        console.log("MockstETH:", address(mockLido.stETH()));
        console.log("MockUniswap:", address(mockUniswap));
        console.log("MockGMX:", address(mockGMX));
    }
}