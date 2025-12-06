# 🚀 Team Setup Guide - Delta-Neutral Vault

Quick setup guide for team members to get the project running locally.

## 📋 Prerequisites

- **Node.js 18+** and **Yarn**
- **Git**

## ⚡ Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/groverInnovate/Trihack.git
cd Trihack
yarn install
```

### 2. Start Development Environment

**Terminal 1 - Blockchain:**
```bash
yarn chain
```
*Keep this running - it's your local blockchain*

**Terminal 2 - Deploy Contracts:**
```bash
yarn deploy
```
*Run this once after starting the chain*

**Terminal 3 - Frontend:**
```bash
yarn start
```
*This starts the web interface at http://localhost:3000*

## 🎯 What You'll See

- **Local Blockchain**: Anvil running on `http://localhost:8545`
- **Frontend**: Next.js app at `http://localhost:3000`
- **Deployed Contracts**: All contracts auto-deployed and connected

## 🔧 Development Commands

```bash
# Blockchain
yarn chain          # Start local blockchain
yarn deploy         # Deploy contracts
yarn verify         # Verify contracts

# Frontend  
yarn start          # Start dev server
yarn build          # Build for production
yarn lint           # Check code quality

# Smart Contracts
yarn foundry:test   # Run contract tests
yarn foundry:build  # Compile contracts
```

## 📁 Key Files to Know

```
packages/
├── foundry/                    # Smart contracts
│   ├── contracts/
│   │   ├── DeltaNeutralAccount.sol      # Main strategy contract
│   │   ├── DeltaNeutralAccountFactory.sol
│   │   └── Mock*.sol                    # Test contracts
│   └── script/Deploy.s.sol              # Deployment script
└── nextjs/                     # Frontend
    ├── app/page.tsx                     # Main page
    ├── components/DeltaNeutralVault.tsx # Main UI component
    └── contracts/deployedContracts.ts   # Auto-generated ABIs
```

## 🐛 Troubleshooting

### "Target Contract is not deployed" Error
```bash
# Make sure blockchain is running, then redeploy
yarn deploy
```

### Port Already in Use
```bash
# Kill processes on ports 3000 or 8545
lsof -ti:3000 | xargs kill -9
lsof -ti:8545 | xargs kill -9
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules yarn.lock
yarn install
```

## 🎮 Testing the App

1. **Connect Wallet**: Use any test wallet (MetaMask with local network)
2. **Get Test ETH**: The local chain provides test accounts with ETH
3. **Try Strategy**: Enter USDC amount and execute delta-neutral strategy
4. **Monitor**: Watch contract interactions in the blockchain logs

## 🤝 Team Workflow

### Making Changes
```bash
git checkout -b feature/your-feature-name
# Make your changes
git add .
git commit -m "feat: describe your changes"
git push origin feature/your-feature-name
# Create PR on GitHub
```

### Staying Updated
```bash
git pull origin main
yarn install  # In case new dependencies were added
```

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Look at contract tests in `packages/foundry/test/`
- Check the deployment logs for contract addresses
- Ask in the team chat!

---

**Happy coding! 🚀**