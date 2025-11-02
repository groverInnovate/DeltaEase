"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Address, parseUnits } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { useAccount, useWalletClient } from "wagmi";
import {
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
  const [logs, setLogs] = useState<string[]>([]);
  const [showStrategyDetails, setShowStrategyDetails] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const initializeSmartAccount = useCallback(async () => {
    try {
      if (!connectedAddress) return;

      addLog("Getting smart account address...");
      const smartAddress = await getSmartAccountAddress(connectedAddress);
      setSmartAccountAddress(smartAddress);

      // For now, assume account is not deployed initially
      setIsSmartAccountDeployed(false);
      addLog("Smart account initialized");
    } catch (error) {
      console.error("Failed to initialize smart account:", error);
      addLog("Failed to initialize smart account");
      toast.error("Failed to initialize smart account");
    }
  }, [connectedAddress]);

  // Initialize smart account address when wallet connects
  useEffect(() => {
    if (connectedAddress && chain?.id === arbitrumSepolia.id) {
      initializeSmartAccount();

      console.log("Using deployed mock contracts on Arbitrum Sepolia");
    }
  }, [connectedAddress, chain, initializeSmartAccount]);

  // No need to fetch USDC balance since we mint directly to smart account

  const handlePrepareStrategy = async () => {
    if (!walletClient || !connectedAddress || !smartAccountAddress || !usdcAmount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    setIsLoading(true);
    try {
      addLog("Preparing strategy...");

      // Just validate the inputs and mark as ready
      const amount = parseUnits(usdcAmount, 6);

      if (amount <= 0) {
        throw new Error("Invalid amount");
      }

      setReadyToExecute(true);
      addLog("Strategy ready to execute");
      toast.success("✅ Strategy ready to execute!");
    } catch (error: any) {
      console.error("Strategy preparation failed:", error);
      addLog(`Preparation failed: ${error.message}`);
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

      addLog("=== EXECUTING STRATEGY WITH DIRECT MINTING ===");
      addLog(`Smart Account: ${smartAccountAddress}`);
      addLog(`USDC Amount: ${usdcAmount}`);

      // Test MockUSDC first
      addLog("Testing MockUSDC contract...");
      const { testMockUSDC } = await import("~~/lib/testMockUSDC");
      const usdcTest = await testMockUSDC(connectedAddress, smartAccountAddress);

      if (!usdcTest.success) {
        throw new Error(`MockUSDC test failed: ${usdcTest.error}`);
      }
      addLog("MockUSDC test passed");

      // Import test functions
      const { testBasicSmartAccount } = await import("~~/lib/simpleTest");

      addLog("Testing smart account...");
      const basicTest = await testBasicSmartAccount(walletClient, smartAccountAddress, connectedAddress);

      if (!basicTest.exists) {
        // Deploy the account first
        addLog("Deploying smart account...");
        await deploySmartAccount(walletClient, connectedAddress);
        setIsSmartAccountDeployed(true);
        addLog("Smart account deployed successfully");

        // Test again after deployment
        const retestResult = await testBasicSmartAccount(walletClient, smartAccountAddress, connectedAddress);

        if (!retestResult.canCall) {
          throw new Error(`Smart account deployed but not callable: ${retestResult.error}`);
        }
      } else if (!basicTest.canCall) {
        throw new Error(`Smart account exists but not callable: ${basicTest.error}`);
      }

      // Execute the strategy with direct USDC minting
      addLog("Executing delta-neutral strategy...");
      const txHash = await executeCompleteStrategy(walletClient, smartAccountAddress, connectedAddress, amount);

      addLog("Waiting for confirmation...");

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      if (receipt.status === "success") {
        addLog("🎉 Delta-neutral strategy executed successfully!");
        addLog(`Transaction hash: ${txHash}`);
        toast.success("🎉 Delta-neutral strategy executed successfully!");
        setUsdcAmount("");
        setReadyToExecute(false);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Strategy execution failed:", error);
      addLog(`Strategy failed: ${error.message}`);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Wrong Network</h1>
          <p className="text-gray-600 mb-4">Please switch to Arbitrum Sepolia</p>
          <p className="text-sm text-gray-500">Chain ID: 421614</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Δ</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">DeltaNeutral</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Ethereum</span>
            </div>
            <div className="text-sm text-gray-600">
              0 ETH
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">0xD584...1C58</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Strategy Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Activate Delta Neutral Strategy
              </h1>
              <p className="text-gray-600 mb-8">
                Deposit USDC and start earning with a single, gasless click.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AMOUNT TO DEPOSIT
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={usdcAmount}
                    onChange={e => setUsdcAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-4 text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                    disabled={isLoading}
                  />
                  <div className="absolute right-4 top-4 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <span className="text-gray-700 font-medium">USDC</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Wallet Balance: 1050.20 USDC
                  </span>
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    MAX
                  </button>
                </div>
              </div>

              {/* Strategy Details */}
              <div className="mb-6">
                <button
                  onClick={() => setShowStrategyDetails(!showStrategyDetails)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-gray-700">Strategy Details</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      showStrategyDetails ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showStrategyDetails && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <div className="space-y-2">
                      <div>• Deploy smart account (if needed)</div>
                      <div>• Mint USDC directly to smart account</div>
                      <div>• Swap USDC → ETH on Uniswap</div>
                      <div>• Stake ETH → stETH on Lido</div>
                      <div>• Open ETH short on GMX (1x leverage)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={readyToExecute ? handleExecuteStrategy : handlePrepareStrategy}
                disabled={!isConnected || !isValidAmount() || isLoading}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                  !isConnected || !isValidAmount() || isLoading
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {currentStep || "Processing..."}
                  </div>
                ) : !isConnected ? (
                  "Connect Wallet"
                ) : !isValidAmount() ? (
                  "Enter Amount"
                ) : readyToExecute ? (
                  "Execute Strategy"
                ) : (
                  "Prepare Strategy"
                )}
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Smart Wallet Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">💼</span>
                </div>
                <span className="font-semibold text-gray-900">Smart Wallet</span>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">$1,500.00</div>
                <div className="text-sm text-green-600 mb-4">5.2% APY</div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <span>0x12...788e</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">Active</span>
                </div>
              </div>

              {smartAccountAddress && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Smart Account Address:</div>
                  <div className="text-xs font-mono text-gray-800 break-all">
                    {smartAccountAddress}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {isSmartAccountDeployed ? "✅ Deployed" : "⏳ Not deployed"}
                  </div>
                </div>
              )}
            </div>

            {/* Live Logs Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <span className="font-semibold text-gray-900">Live Logs</span>
              </div>

              <div className="h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-12 h-12 mb-3 opacity-50">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-medium mb-1">No activity yet</div>
                      <div className="text-sm">
                        Live transaction logs will appear here when you activate your strategy
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
