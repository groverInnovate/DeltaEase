"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

// import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/**
 * Delta-Neutral Vault Component
 * Main interface for users to interact with the delta-neutral strategy
 */
export const DeltaNeutralVault = () => {
  const { address: connectedAddress } = useAccount();
  const [usdcAmount, setUsdcAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Read current position - placeholder for now
  const currentPosition = null;

  // Placeholder for strategy execution

  const handleExecuteStrategy = async () => {
    if (!connectedAddress || !usdcAmount) return;

    setIsLoading(true);
    try {
      // This would be replaced with proper ERC-4337 UserOperation in production
      // For now, we'll use a placeholder function call
      console.log("Strategy execution would happen here with:", usdcAmount);
    } catch (error) {
      console.error("Strategy execution failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 Delta-Neutral Vault</h1>
          <p className="text-gray-600">One-click gasless DeFi strategy</p>
        </div>

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
              placeholder="1000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-3 text-gray-500">USDC</span>
          </div>
        </div>

        {/* Strategy Explanation */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. 🔄 Swap USDC → ETH</li>
            <li>2. 🥩 Stake ETH → stETH (earn yield)</li>
            <li>3. 📉 Open ETH short (hedge risk)</li>
            <li>4. 💰 Earn yield with zero market exposure</li>
          </ol>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExecuteStrategy}
          disabled={!connectedAddress || !usdcAmount || isLoading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            !connectedAddress || !usdcAmount || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Executing Strategy...
            </div>
          ) : !connectedAddress ? (
            "Connect Wallet"
          ) : (
            "🚀 Execute Delta-Neutral Strategy"
          )}
        </button>

        {/* Current Position */}
        {currentPosition && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Active Position</h3>
            <p className="text-sm text-green-600">Strategy is active and earning yield!</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <div className="text-2xl mb-1">⛽</div>
            <p className="text-xs text-gray-600">Gasless</p>
          </div>
          <div className="p-3">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-gray-600">One-Click</p>
          </div>
          <div className="p-3">
            <div className="text-2xl mb-1">🛡️</div>
            <p className="text-xs text-gray-600">Risk-Free</p>
          </div>
        </div>
      </div>
    </div>
  );
};
