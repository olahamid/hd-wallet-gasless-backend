# Gasless ERC-20(USDT) Transaction Service

## Table of Contents
- [About The Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## About The Project

A HD wallet-backed gasless transaction service for ERC-20 tokens. Users can create an HD wallets, that take and hold Ether and ERC 2O tokens, with the availabe ABIs, the project is compatible to 3 differernt tokens,USDT- Decimal of 6, RUTO_USDT- Decimal of 6(mainly used as POC in this repo), RUTO_AI- decimal of 18, and transfer tokens without holding ETH for gas fees through cryptographic signature verification. 


### Key Features
- **Gasless Transfers**: Users pay zero gas fees
- **HD Wallet Management**: Secure key derivation and storage
- **Signature Verification**: Cryptographic authentication
- **Credit System**: Internal balance tracking
- **RESTful API**: Complete HTTP interface
- **Custom Ruto-AI USDT/RUTO_AI ERC20** complete a well written usdt and erc 20 contract 

## Built With

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Ethers.js** - Ethereum interaction
- **Alchemy/Infura** - Blockchain infrastructure
- **Sepolia Testnet** - Development network
- **foundry** - smart contract development

## Getting Started

### Prerequisites
- Node.js (v16+)
- NPM or Yarn
- foundry
- Alchemy API key
- Sepolia testnet tokens

### Installation

1. Clone the repository
```bash
git clone https://github.com/olahamid/ruto-gasless-service.git
cd ruto-gasless-service
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Generate HD wallet
```bash
npm run create-wallet
```

5. Start the service
```bash
npm start
```

The service will be available at `http://localhost:3000`


### Core Components

#### 1. HD Wallet Management
- **Secure Key Derivation**: Uses BIP-44 standard (`m/44'/60'/0'/0/0`)
- **Encrypted Storage**: Private keys stored with AES encryption
- **Single Managed Address**: One service wallet pays all gas fees
**Create an HD-wallet**
```bash
npm run create-wallet
```
**Load a created wallet**
```bash
npm run load-wallet
```
**sign a Transaction with the wallet**
```bash
npm run sign-Tx
```

#### 2. Gasless Transaction Flow
```
User → Sign Message → API → Verify Signature → Execute Transfer → Return Receipt
```
**start the service** 
```bash
npm start
```
**run gasless transfer**
```bash
npm run test-gasless
```

#### 4. Token Creation and Integration
- **ERC-20 Compatible**: Works with any standard token
- **Multi-Token Support**:  RUTO_USDT, RUTO_AI tokens
- **Balance Tracking**: Real-time token balances
**compile token**
```bash
cd contracts
forge build
```
**deploy RUTO_USDT contracts**
```bash
forge script script/RUTO_USDT.s.sol --broadcast --rpc-url https://eth-sepolia.g.alchemy.com/v2/{alchemy_private_key} --private-key {private_key} --verify --etherscan-api-key {etherscan-api-key}
```
**deploy RUTO_AI contracts**
```bash
forge script script/RUTO_AI.s.sol --broadcast --rpc-url https://eth-sepolia.g.alchemy.com/v2/{alchemy_private_key} --private-key {private_key} --verify --etherscan-api-key {etherscan-api-key}
```
#### 3. Security Layer
- **Signature Verification**: Ensures message authenticity
- **Replay Protection**: Timestamp + nonce validation
- **Credit System**: Internal balance management
- **Input Validation**: Comprehensive request sanitization
## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Get Wallet Information
```http
GET /wallet/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "tokenInfo": {
      "name": "RUTO_AI USDT",
      "symbol": "RUTO_USDT",
      "decimals": 6
    },
    "balance": "14999999528.995"
  }
}
```

#### Get User Credit
```http
GET /user/credit/:address
```

#### Add User Credit (Testing)
```http
POST /user/credit
Content-Type: application/json

{
  "userAddress": "0x...",
  "amount": "1000"
}
```

#### Gasless Transfer
```http
POST /transfer/gasless
Content-Type: application/json

{
  "userAddress": "0x...",
  "to": "0x...",
  "amount": "100",
  "timestamp": 1751883182163,
  "signature": "0x..."
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "gasUsed": "65000",
    "gasPaidBy": "0x...",
    "authorizedBy": "0x...",
    "isGasless": true
  }
}
```

### Message Signing Format
```javascript
const message = `Transfer ${amount} tokens from ${userAddress} to ${to} at ${timestamp}`;
const signature = await wallet.signMessage(message);
```

## Security Features

### 1. Signature Verification
- **ECDSA Signatures**: Standard Ethereum message signing
- **Address Recovery**: Cryptographic proof of authorization
- **Message Integrity**: Tamper-proof transaction details

### 2. Replay Attack Prevention
- **Timestamp Validation**: 5-minute window for requests (BLOCK.TIMESTAMP LIMIT)
- **Nonce System**: Unique transaction identifiers
- **Used Signature Tracking**: Prevents duplicate transactions


## Testing

### Run Test Suite
```bash
npm run test-gasless
```

### Generate Test Signatures
```bash
npm run generate-signature
```

### Manual Testing
```bash
# Test contract functions
npm run testContract

# Test wallet loading
npm run test-load-wallet
```

## Deployment

### Environment Variables
```env
ALCHEMY_API_KEY=your_alchemy_key
CUSTOM_PHRASE=your_hd_wallet_seed
PORT=3000
```

```

## Project Structure
```
ABIs
└── ruto_usdtABI.json
└── usdtABI.json
└── ruto_AiABI.json
src/
├── config/
│   └── config.wallet.js     # Network configuration
    └── database.js
├── contracts/
    └── broadcast
    └── script
        └── R_USDT.s.sol
        └── RUTO_USDT.s.sol
    └── src
        └── RUTO_USDT.sol
        └── RUTO_AI.sol
    └── test
    └── foundry.toml
    └── makefile
├── server/
│   └── app.js              # Main application
    └── client-demo.js
    └── generateSignature.js
├── services/
│   └── tokenService.js     # Token interactions
├── test/
│   ├── gasless-test.js     # Comprehensive tests
│   └── generateSignature.js # Test utilities
└── wallet/
    └── computeWallet.js    # HD wallet management
    └── loadWallet.js
    └── signTX.js
```


### Development Guidelines
- Follow REST API conventions
- Add comprehensive tests
- Update documentation
- Maintain security standards
- Add ERC2771(Meta Tx) OR ERC4773(AA)

## Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin `)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact

**Abdul-Hamid Ola** - [@olahamid](https://github.com/olahamid)

Project Link: [https://github.com/olahamid/ruto-gasless-service](https://github.com/olahamid/ruto-gasless-service)

[Report Bug](https://github.com/olahamid/ruto-gasless-service/issues) · [Request Feature](https://github.com/olahamid/ruto-gasless-service/issues)




---
