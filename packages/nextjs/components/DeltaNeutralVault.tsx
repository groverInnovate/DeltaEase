"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Address, parseUnits } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import {
  CONTRACTS,
  deploySmartAccount,
  executeCompleteStrategy,
  getSmartAccountAddress,
  publicClient,
} from "~~/lib/erc4337Correct";

/**
 * Delta-Neutral Vault Component with Complete ERC-4337 Integration
 */
export const DeltaNeutralVault = () => {
  const { address: connectedAddress, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

  // State management
  const [usdcAmount, setUsdcAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [smartAccountAddress, setSmartAccountAddress] = useState<Address | null>(null);
  const [isSmartAccountDeployed, setIsSmartAccountDeployed] = useState(false);
  const [readyToExecute, setReadyToExecute] = useState(false);

  // Initialize smart account address when wallet connects
  useEffect(() => {
    if (connectedAddress && chain?.id === arbitrumSepolia.id) {
      initializeSmartAccount();

      console.log("Using deployed mock contracts on Arbitrum Sepolia");
    }
  }, [connectedAddress, chain, initializeSmartAccount]);

  const initializeSmartAccount = useCallback(async () => {
    try {
      if (!connectedAddress) return;

      setCurrentStep("Getting smart account address...");
      const smartAddress = await getSmartAccountAddress(connectedAddress);
      setSmartAccountAddress(smartAddress);

      // For now, assume account is not deployed initially
      setIsSmartAccountDeployed(false);

      setCurrentStep("");
    } catch (error) {
      console.error("Failed to initialize smart account:", error);
      toast.error("Failed to initialize smart account");
      setCurrentStep("");
    }
  }, [connectedAddress]);

  // No need to fetch USDC balance since we mint directly to smart account

  const handlePrepareStrategy = async () => {
    if (!walletClient || !connectedAddress || !smartAccountAddress || !usdcAmount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    setIsLoading(true);
    try {
      setCurrentStep("Preparing strategy...");

      // Just validate the inputs and mark as ready
      const amount = parseUnits(usdcAmount, 6);

      if (amount <= 0) {
        throw new Error("Invalid amount");
      }

      setReadyToExecute(true);
      toast.success("✅ Strategy ready to execute!");
    } catch (error: any) {
      console.error("Strategy preparation failed:", error);
      toast.error(`Preparation failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setCurrentStep("");
    }
  };

  const handleExecuteStrategy = async () => {
    if (!walletClient || !connectedAddress || !smartAccountAddress || !usdcAmount) {
      toast.error("Please prepare strategy first");
      return;
    }

    setIsLoading(true);
    try {
      const amount = parseUnits(usdcAmount, 6);

      console.log("=== EXECUTING STRATEGY WITH DIRECT MINTING ===");
      console.log("Smart Account Address:", smartAccountAddress);
      console.log("Owner Address:", connectedAddress);
      console.log("USDC Amount:", amount.toString());
      console.log("Is Account Deployed:", isSmartAccountDeployed);

      // Test MockUSDC first
      setCurrentStep("Testing MockUSDC contract...");
      const { testMockUSDC } = await import("~~/lib/testMockUSDC");
      const usdcTest = await testMockUSDC(connectedAddress, smartAccountAddress);
      console.log("MockUSDC test result:", usdcTest);

      if (!usdcTest.success) {
        throw new Error(`MockUSDC test failed: ${usdcTest.error}`);
      }

      // Import test functions
      const { testBasicSmartAccount } = await import("~~/lib/simpleTest");

      setCurrentStep("Testing smart account...");
      const basicTest = await testBasicSmartAccount(walletClient, smartAccountAddress, connectedAddress);

      console.log("Basic test result:", basicTest);

      if (!basicTest.exists) {
        // Deploy the account first
        setCurrentStep("Deploying smart account...");
        await deploySmartAccount(walletClient, connectedAddress);
        setIsSmartAccountDeployed(true);

        // Test again after deployment
        const retestResult = await testBasicSmartAccount(walletClient, smartAccountAddress, connectedAddress);
        console.log("Retest after deployment:", retestResult);

        if (!retestResult.canCall) {
          throw new Error(`Smart account deployed but not callable: ${retestResult.error}`);
        }
      } else if (!basicTest.canCall) {
        throw new Error(`Smart account exists but not callable: ${basicTest.error}`);
      }

      // Execute the strategy with direct USDC minting
      setCurrentStep("Executing delta-neutral strategy...");
      const txHash = await executeCompleteStrategy(walletClient, smartAccountAddress, connectedAddress, amount);

      setCurrentStep("Waiting for confirmation...");

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (receipt.status === "success") {
        toast.success("🎉 Delta-neutral strategy executed successfully!");
        console.log("Transaction hash:", txHash);
        setUsdcAmount("");
        setReadyToExecute(false);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Strategy execution failed:", error);
      toast.error(`Strategy failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setCurrentStep("");
    }
  };

  const isValidAmount = () => {
    if (!usdcAmount) return false;
    const amount = parseFloat(usdcAmount);
    return amount > 0; // No balance check needed since we mint directly
  };

  const isCorrectNetwork = chain?.id === arbitrumSepolia.id;

  if (!isCorrectNetwork && isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Wrong Network</h1>
          <p className="text-gray-600 mb-4">Please switch to Arbitrum Sepolia</p>
          <p className="text-sm text-gray-500">Chain ID: 421614</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 Delta-Neutral Vault</h1>
          <p className="text-gray-600">ERC-4337 Gasless DeFi Strategy</p>
          {smartAccountAddress && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                Smart Account: {smartAccountAddress.slice(0, 6)}...{smartAccountAddress.slice(-4)}
              </p>
              <p className="text-xs text-blue-500">{isSmartAccountDeployed ? "✅ Deployed" : "⏳ Not deployed yet"}</p>
            </div>
          )}
        </div>

        {/* Network Info */}
        {isConnected && (
          <div className="mb-6 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">📡 Network: Arbitrum Sepolia ✅</p>
            <p className="text-sm text-green-600">💰 No USDC balance needed! We mint directly to smart account</p>
          </div>
        )}

        {/* Strategy Stats */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Expected APY</p>
              <p className="text-2xl font-bold text-green-600">~6%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Market Risk</p>
              <p className="text-2xl font-bold text-blue-600">Zero</p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">USDC Amount</label>
          <div className="relative">
            <input
              type="number"
              value={usdcAmount}
              onChange={e => setUsdcAmount(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <span className="absolute right-3 top-3 text-gray-500">USDC</span>
          </div>
          {usdcAmount && !isValidAmount() && <p className="text-red-500 text-sm mt-1">Insufficient USDC balance</p>}
        </div>

        {/* Strategy Steps */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Simplified Strategy:</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div className={readyToExecute ? "text-green-600" : ""}>
              <strong>Step 1:</strong> {readyToExecute ? "✅" : "📝"} Prepare strategy (validate inputs)
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <strong>Step 2:</strong> Execute strategy:
              <ul className="ml-4 mt-1 space-y-1 text-xs">
                <li>• {isSmartAccountDeployed ? "Account ready" : "Deploy smart account (if needed)"}</li>
                <li>• Mint USDC directly to smart account</li>
                <li>• Swap USDC → ETH on Uniswap</li>
                <li>• Stake ETH → stETH on Lido</li>
                <li>• Open ETH short on GMX (1x)</li>
              </ul>
              <p className="text-xs text-blue-600 mt-1">No permits needed! Direct minting for testing.</p>
            </div>
          </div>
        </div>

        {/* Current Step Display */}
        {currentStep && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">⏳ {currentStep}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Prepare Button */}
          {!readyToExecute && (
            <button
              onClick={handlePrepareStrategy}
              disabled={!isConnected || !isValidAmount() || isLoading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                !isConnected || !isValidAmount() || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Preparing...
                </div>
              ) : (
                "📝 Prepare Strategy"
              )}
            </button>
          )}

          {/* Execute Strategy Button */}
          <button
            onClick={handleExecuteStrategy}
            disabled={!isConnected || !readyToExecute || isLoading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              !isConnected || !readyToExecute || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Executing Strategy...
              </div>
            ) : !isConnected ? (
              "Connect Wallet"
            ) : !readyToExecute ? (
              "Prepare Strategy First"
            ) : isSmartAccountDeployed ? (
              "🚀 Execute Strategy (Direct Mint)"
            ) : (
              "🚀 Deploy & Execute Strategy"
            )}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <div className="text-2xl mb-1">⛽</div>
            <p className="text-xs text-gray-600">Gasless</p>
          </div>
          <div className="p-3">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-gray-600">One UserOp</p>
          </div>
          <div className="p-3">
            <div className="text-2xl mb-1">🛡️</div>
            <p className="text-xs text-gray-600">ERC-4337</p>
          </div>
        </div>

        {/* Contract Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700">Contract Addresses</summary>
            <div className="mt-2 space-y-1 text-gray-600">
              <p>• Factory: {CONTRACTS.FACTORY.slice(0, 10)}...</p>
              <p>• USDC: {CONTRACTS.USDC.slice(0, 10)}...</p>
              <p>• Uniswap: {CONTRACTS.UNISWAP_ROUTER.slice(0, 10)}...</p>
              <p>• EntryPoint: {CONTRACTS.ENTRY_POINT.slice(0, 10)}...</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
