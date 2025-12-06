# 🔮 Alchemy Integration Setup Guide

This guide will help you set up Alchemy's Account Kit for ERC-4337 functionality in the Delta-Neutral Vault project.

## 🎯 What You Need

1. **Alchemy Account** - Sign up at [alchemy.com](https://alchemy.com)
2. **API Key** - For Arbitrum Sepolia
3. **Gas Manager Policy** - For sponsoring transactions

## 📋 Step-by-Step Setup

### 1. Create Alchemy Account & Get API Key

1. Go to [dashboard.alchemy.com](https://dashboard.alchemy.com)
2. Sign up or log in
3. Create a new app:
   - **Chain**: Arbitrum
   - **Network**: Arbitrum Sepolia
   - **Name**: Delta-Neutral-Vault
4. Copy your **API Key**

### 2. Set Up Gas Manager (Paymaster)

1. In your Alchemy dashboard, go to **Account Kit**
2. Click **Gas Manager**
3. Create a new policy:
   - **Name**: Delta-Neutral-Strategy
   - **Chain**: Arbitrum Sepolia
   - **Spending Rules**: Set monthly limit (e.g., $10)
   - **Allowlist**: Add your contract addresses (optional)
4. Copy the **Policy ID**

### 3. Configure Environment Variables

Create `.env.local` in `packages/nextjs/`:

```bash
# Alchemy Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID=your_gas_policy_id_here

# Contract Addresses (auto-filled after deployment)
NEXT_PUBLIC_FACTORY_ADDRESS=0x196dBCBb54b8ec4958c959D8949EBFE87aC2Aaaf
```

### 4. Test the Integration

```bash
# Start the development environment
yarn chain    # Terminal 1
yarn deploy   # Terminal 2
yarn start    # Terminal 3
```

## 🎮 How It Works

### ERC-4337 Flow with Alchemy:

1. **User connects wallet** → MetaMask/WalletConnect
2. **Smart account creation** → Alchemy Account Kit creates smart account
3. **USDC Permit signature** → User signs permit (gasless)
4. **UserOperation building** → Alchemy bundles all strategy steps
5. **Gas sponsorship** → Alchemy Gas Manager pays gas fees
6. **Execution** → Bundler executes delta-neutral strategy

### Strategy Steps (All in One Transaction):

```
1. USDC Permit     → Allow smart account to spend USDC
2. USDC Transfer   → Move USDC from EOA to smart account  
3. USDC Approve    → Approve Uniswap to spend USDC
4. Swap USDC→ETH   → Convert USDC to ETH via Uniswap
5. Stake ETH       → Stake ETH on Lido for stETH
6. Approve stETH   → Approve GMX to use stETH as collateral
7. Open Short      → Open ETH short position on GMX
```

## 🔧 Troubleshooting

### Common Issues:

**"Invalid API Key"**
- Check your API key is correct
- Ensure it's for Arbitrum Sepolia network

**"Gas Manager Policy Not Found"**
- Verify Policy ID is correct
- Check policy is active and funded

**"Smart Account Creation Failed"**
- Ensure wallet is connected
- Check network is Arbitrum Sepolia

**"Transaction Failed"**
- Check contract addresses are correct
- Verify USDC balance is sufficient
- Ensure permit signature is valid

### Debug Mode:

Add to your `.env.local`:
```bash
NEXT_PUBLIC_DEBUG=true
```

This will show detailed logs in browser console.

## 📊 Monitoring

### Alchemy Dashboard:
- **Account Kit** → View smart account activity
- **Gas Manager** → Monitor gas usage and spending
- **API Requests** → Track RPC calls

### Transaction Tracking:
- UserOperation hash → Track on [jiffyscan.xyz](https://jiffyscan.xyz)
- Transaction hash → Track on [arbiscan.io](https://sepolia.arbiscan.io)

## 🚀 Production Deployment

For mainnet deployment:

1. **Switch to Arbitrum One**:
   ```bash
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_mainnet_api_key
   ```

2. **Update contract addresses** to mainnet versions:
   - USDC: `0xA0b86a33E6441b8435b662f0E2d0B8A0E4B5B8B0`
   - Uniswap Router: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
   - Lido: `0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84`

3. **Fund Gas Manager** with sufficient ETH for production usage

## 💡 Advanced Features

### Custom Gas Policies:
- Set spending limits per user
- Whitelist specific functions
- Time-based restrictions

### Smart Account Customization:
- Multi-owner accounts
- Session keys for automation
- Custom validation logic

---

**Need Help?** 
- [Alchemy Docs](https://docs.alchemy.com/docs/account-kit-overview)
- [Account Kit Examples](https://github.com/alchemyplatform/aa-sdk)
- [Discord Support](https://discord.gg/alchemy)