## RUTO GASLESS-SERVICE assessment.

ruto-gasless-service/
├── src/
│   ├── wallet/                      # All HD wallet logic
│   │   ├── deriveWallet.js         # Derive + encrypt wallet from mnemonic
│   │   └── loadWallet.js           # Decrypt wallet when sending tokens
│   │
│   ├── routes/                     # Express route handlers
│   │   ├── address.js              # GET /address
│   │   ├── balance.js              # GET /balance
│   │   └── send.js                 # POST /send
│   │
│   ├── contracts/                  # ERC-20 contract interaction logic
│   │   └── usdt.js                 # Loads and uses your deployed ERC20
│   │
│   ├── utils/                      # Helper functions (encryption, validation)
│   │   └── encryptor.js
│   │
│   └── server.js                   # Express entry point (API server)
│
├── wallet.json                     # Encrypted wallet + address
├── .env                            # Secrets: mnemonic, password, RPC URL, etc.
├── package.json
├── README.md


**Contract Address** = 0x541EB03091F092f03369Ba1a3E819F3427428041
**sapolia Link** = https://sepolia.etherscan.io/address/0x541eb03091f092f03369ba1a3e819f3427428041
**Public Address:** 0xecd514994Dc2DA214CFf747885BE2e177f97172e
