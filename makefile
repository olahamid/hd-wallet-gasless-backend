# File: makefile
# Makefile for Ruto Gasless Service

# WALLET MAKER&SIGNER COMMANDS
# node commands

ANVIL_PRIVATE_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ETHERSCAN_API_KEY = U6E4YNW363YMBZK5JDGGXUCIHDK7ATU6EE
RPC_URL = https://eth-sepolia.g.alchemy.com/v2/Po1HylCAiEbtB1DPzbg9y
PRIVATE_KEY = 0xacde8cb55f2f90375b6636fca3dedbe7c0de58dfc6295e2cb26df27385bf1c8b

test-wallet:
	node src/wallet/testLoadWallet.js

sign-tx:
	node src/wallet/signTX.js

# CONTRACT COMMANDS
# forge commands
contract-build:; forge build

contract-test:; forge test

contract-test-coverage:; forge coverage

contract-deploy:; forge script 

contract-format:; forge fmt

anvil;: anvil

contract-deploy-broadcast :;forge script script/RUTO_USDT.s.sol \
	--broadcast \
	--rpc-url $(RPC_URL) \
	--private-key $(PRIVATE_KEY) \
	--verify \
	--etherscan-api-key $(ETHERSCAN_API_KEY)
contract-deploy-local-anvil:; forge script script/RUTO_USDT.s.sol \
	--broadcast \
	--rpc-url "127.0.0.1:8545" \
	--private-key "$(ANVIL_PRIVATE_KEY)" 

