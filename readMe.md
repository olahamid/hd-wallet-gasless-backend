# Gasless ERC-20(USDT) Transaction Service

## Table of Contents
- [About The Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [API Documentation AND Endpoints](#api-documentation)
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
- **Alchemy** - Blockchain infrastructure
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
## API Documentation AND Endpoints

### Base URL
```
http://localhost:3000/api
```

#### Get Wallet Information
```http
  - GET /wallet/info
  OR 
  - curl -X GET http://localhost:3000/api/wallet/info | jq
```


**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0xecd514994Dc2DA214CFf747885BE2e177f97172e",
    "tokenInfo": {
      "name": "RUTO_AI USDT",
      "symbol": "RUTO_USDT",
      "decimals": "6"
    },
    "balance": "14999999028.995"
  }
}
```
**claim credit**

```
curl -X POST http://localhost:3000/api/user/credit   -H "Content-Type: application/json"   -d '{"userAddress": "0x8fd379246834eac74B8419FfdA202CF8051F7A03", "amount": "1000"}' | jq
```
**Response**
```
olahamid04@OlaHamid:~/ruto-gasless-service$ curl -X POST http://localhost:3000/api/user/credit   -H "Content-Type: application/json"   -d '{"userAddress": "0x8fd379246834eac74B8419FfdA202CF8051F7A03", "amount": "1000"}' | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   199  100   120  100    79   5152   3391 --:--:-- --:--:-- --:--:--  8652
{
  "success": true,
  "data": {
    "userAddress": "0x8fd379246834eac74B8419FfdA202CF8051F7A03",
    "previousCredit": 0,
    "newCredit": 1000
  }
}
olahamid04@OlaHamid:~/ruto-gasless-service$ 
```



#### Gasless Transfer
```http
POST /transfer/gasless
Content-Type: application/json
```
**OR**
```
npm test-gasless
```
**OR**
```
curl -X POST http://localhost:3000/api/transfer/gasless   -H "Content-Type: application/json"   -d '{"userAddress": "0x8fd379246834eac74B8419FfdA202CF8051F7A03", "to": "0x52102c90aFc51Eb171fa08bB56c892B46bD91177", "amount": "100", "timestamp": 1751883182163, "signature": "0x096af88bf2ae1fe2e7c99affa0edcb32c64343231863d8cdeb7fc4d5d0e515c31b5cae1aeb61c60fb09d28a99c48f4b3e1d88282fcf59ad9f65604cd81ffc2911c"}' | jq
```
**PASSED RESPONSE**

```
{
  "success": true,
  "data": {
    "transactionHash": "0x55c7432e611ac6384b61daa389d5abd4906a79dcb6635b19680e9ef492a37fa5",
    "blockNumber": 8712742,
    "gasUsed": "35352",
    "gasPaidBy": "0xecd514994Dc2DA214CFf747885BE2e177f97172e",
    "authorizedBy": "0x8fd379246834eac74B8419FfdA202CF8051F7A03",
    "from": "0xecd514994Dc2DA214CFf747885BE2e177f97172e",
    "to": "0x52102c90aFc51Eb171fa08bB56c892B46bD91177",
    "amount": "100",
    "userCreditBefore": 1000,
    "userCreditAfter": 900,
    "serviceBalance": "14999999028.995",
    "isGasless": true,
    "verificationDetails": {
      "signatureValid": true,
      "messageVerified": "Transfer 100 tokens from 0x8fd379246834eac74B8419FfdA202CF8051F7A03 to 0x52102c90aFc51Eb171fa08bB56c892B46bD91177 at 1751883182163",
      "recoveredAddress": "0x8fd379246834eac74B8419FfdA202CF8051F7A03"
    }
  }
}
```

#### Get User Credit
```
curl -X GET http://localhost:3000/api/user/credit/{ox....useraddr} | jq
```
```
curl -X GET http://localhost:3000/api/user/credit/0x8fd379246834eac74B8419FfdA202CF8051F7A03 | jq
```

**Success Response:**
```json
olahamid04@OlaHamid:~/ruto-gasless-service$ curl -X GET http://localhost:3000/api/user/credit/0x8fd379246834eac74B8419FfdA202CF8051F7A03 | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    93  100    93    0     0  22594      0 --:--:-- --:--:-- --:--:-- 23250
{
  "success": true,
  "data": {
    "address": "0x8fd379246834eac74B8419FfdA202CF8051F7A03",
    "credit": "0"
  }

}
```

### GET HEALTH CHECK
```
curl -X GET http://localhost:3000/api/health | jq
```
**PASSED RESPONCE**

```
olahamid04@OlaHamid:~/ruto-gasless-service$ curl -X GET http://localhost:3000/api/health | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   206  100   206    0     0  99613      0 --:--:-- --:--:-- --:--:--  100k
{
  "success": true,
  "data": {
    "status": "healthy",
    "managedAddress": "0xecd514994Dc2DA214CFf747885BE2e177f97172e",
    "totalUsers": 0,
    "totalTransactions": 0,
    "isGaslessService": true,
    "timestamp": "2025-07-07T17:55:10.066Z"
  }
}
olahamid04@OlaHamid:~/ruto-gasless-service$ 
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
 ### 3. Credit System
- **Internal Balances:** Off-chain credit tracking, allow centralised accounting instead of calling mappings data from contract
- **Overdraft Protection:** Prevents negative balances.

## Testing

### Run Test Suite
```bash
npm run test-gasless
```

### Generate Test Signatures
```bash
npm run generate-signature
```

**Contract Testing**
```bash
# Test contract functions
npm run testContract
```
**Wallet Testing**
```
npm run test-load-wallet
```

## Deployment

### Environment Variables
```env
ALCHEMY_API_KEY=your_alchemy_key
CUSTOM_PHRASE=your_hd_wallet_seed
PORT=3000
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
- add more better unit and integration tests to the REPO
- Update documentation
- do manual reviews/audits 
- Add ERC2771(Meta Tx) OR ERC4773(AA) to allow decentralised methodology of gasless implementation

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
