# Delta-Neutral Vault - Trihack Project

A sophisticated DeFi protocol implementing delta-neutral strategies using Account Abstraction (ERC-4337) for seamless user experience.

## 🎯 Project Overview

This project implements a delta-neutral vault strategy that:
- Stakes ETH in Lido to earn staking rewards
- Opens short positions on GMX to hedge against ETH price movements
- Provides users with yield while maintaining price neutrality
- Uses ERC-4337 Account Abstraction for gasless transactions

## 🏗️ Architecture

### Smart Contracts
- **DeltaNeutralAccount**: ERC-4337 compliant smart account with delta-neutral strategy execution
- **DeltaNeutralAccountFactory**: Factory contract for creating new accounts
- **Mock Contracts**: Lido, Uniswap, and GMX mocks for local testing

### Frontend
- **Next.js**: Modern React framework with TypeScript
- **RainbowKit**: Wallet connection and management
- **Wagmi**: React hooks for Ethereum
- **Scaffold-ETH**: Development framework and tooling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/groverInnovate/Trihack.git
cd Trihack
```

2. **Install dependencies**
```bash
yarn install
```

3. **Start local blockchain**
```bash
yarn chain
```

4. **Deploy contracts** (in a new terminal)
```bash
yarn deploy
```

5. **Start frontend** (in a new terminal)
```bash
yarn start
```

## 📁 Project Structure

```
delta-neutral-vault/
├── packages/
│   ├── foundry/                 # Smart contracts
│   │   ├── contracts/
│   │   │   ├── DeltaNeutralAccount.sol
│   │   │   ├── DeltaNeutralAccountFactory.sol
│   │   │   └── Mock*.sol        # Test contracts
│   │   ├── script/
│   │   │   └── Deploy.s.sol     # Deployment script
│   │   └── test/                # Contract tests
│   └── nextjs/                  # Frontend application
│       ├── app/                 # Next.js app router
│       ├── components/          # React components
│       ├── hooks/               # Custom hooks
│       └── contracts/           # Generated contract ABIs
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json
└── README.md                    # This file
```

## 🔧 Development Commands

### Blockchain & Contracts
```bash
yarn chain          # Start local Anvil blockchain
yarn deploy         # Deploy contracts to local chain
yarn verify         # Verify contracts (for testnets)
yarn foundry:test   # Run contract tests
```

### Frontend
```bash
yarn start          # Start Next.js development server
yarn build          # Build for production
yarn lint           # Run ESLint
yarn format         # Format code with Prettier
```

## 🌐 Deployed Contracts (Local)

When you run `yarn deploy`, the following contracts are deployed:

- **YourContract**: Basic Scaffold-ETH contract
- **DeltaNeutralAccount**: Main strategy contract
- **MockLido**: Simulates Lido liquid staking
- **MockstETH**: Simulates stETH token
- **MockUniswap**: Simulates Uniswap router
- **MockGMX**: Simulates GMX perpetuals
- **Factory**: Creates new delta-neutral accounts

## 🎮 How to Use

1. **Connect Wallet**: Use RainbowKit to connect your wallet
2. **Create Account**: Deploy a new delta-neutral account
3. **Execute Strategy**: Deposit USDC to start the delta-neutral strategy
4. **Monitor Position**: Track your staking rewards and hedged position
5. **Exit Strategy**: Close positions and withdraw funds

## 🧪 Testing

### Smart Contract Tests
```bash
cd packages/foundry
forge test
```

### Frontend Testing
```bash
cd packages/nextjs
yarn test
```

## 🔐 Security Features

- **Account Abstraction**: Gasless transactions and improved UX
- **Session Keys**: Temporary permissions for automated strategies
- **Emergency Controls**: Pause functionality for security
- **Multi-signature**: Support for multi-owner accounts

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity 0.8.20+**
- **Foundry**: Development framework
- **OpenZeppelin**: Security-audited contracts
- **Account Abstraction**: ERC-4337 implementation

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **RainbowKit**: Wallet integration
- **Wagmi**: Ethereum React hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Trihack 2024

This project was developed for Trihack 2024, showcasing innovative DeFi strategies with Account Abstraction.

## 📞 Support

For questions and support:
- Create an issue in this repository
- Contact the development team

---

**Built with ❤️ for Trihack 2024**