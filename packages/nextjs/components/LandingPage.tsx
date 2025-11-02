"use client";

import Link from "next/link";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">DeltaNeutral</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          The Easiest Way to Earn{" "}
          <span className="text-purple-600">Delta-Neutral Yield</span>
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
          Deposit USDC and start earning stable yield with a single, gasless click.
        </p>
        <p className="text-lg text-gray-500 mb-12">
          Powered by Account Abstraction.
        </p>
        
        <Link href="/app">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 inline-flex items-center space-x-2">
            <span>Launch App</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </section>

      {/* How it Works Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How it Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Wallet</h3>
              <p className="text-gray-600">
                A user connects their existing wallet. We instantly create a new, secure Smart Account for them.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">One-Click Deposit</h3>
              <p className="text-gray-600">
                The user decides how much USDC to deposit. No need to buy tokens, approve, or swap.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start Earning</h3>
              <p className="text-gray-600">
                They sign one (gas-free!) transaction and the vault automatically deploys the delta-neutral strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Key Benefits
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Absolutely Zero Gas Fees
              </h3>
              <p className="text-gray-600">
                We use Alchemy&apos;s Paymaster (part of ERC-4337) to sponsor your deposit transactions. 
                You just click, and we cover the gas, making DeFi accessible to everyone.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                All the Complexity, Abstracted
              </h3>
              <p className="text-gray-600">
                No more confusing 5-step processes. Our Smart Account bundles all actions 
                (approve, swap, deposit, short) into a single click for you.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Your Keys, Your Funds
              </h3>
              <p className="text-gray-600">
                Your wallet (like MetaMask) remains the only owner of your Smart Account. 
                We never have access to your funds. It&apos;s the power of on-chain self-custody.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            A Strategy for Any Market
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Our delta-neutral strategy generates yield regardless of market direction by combining 
            liquid staking rewards with hedged positions, ensuring stable returns in any market condition.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Neutral</h3>
              <p className="text-gray-600">
                By maintaining equal long and short positions, your portfolio remains unaffected 
                by ETH price movements while still earning staking rewards.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Stable Yield</h3>
              <p className="text-gray-600">
                Earn consistent returns from liquid staking rewards (~5-6% APY) without 
                exposure to volatile price swings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the future of DeFi with gasless, one-click delta-neutral strategies.
          </p>
          
          <Link href="/app">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-12 py-4 rounded-lg text-xl transition-colors duration-200 inline-flex items-center space-x-2">
              <span>Launch App</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-semibold">DeltaNeutral</span>
            </div>
            
            <div className="text-gray-400">
              <p>&copy; 2024 DeltaNeutral. Powered by ERC-4337.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};