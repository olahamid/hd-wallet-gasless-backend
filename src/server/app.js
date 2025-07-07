// File: src/server/app.js - FIXED Gasless Implementation
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { 
    getTokenName, 
    getTokenSymbol, 
    getTokenDecimals, 
    getBalance, 
    getTotalSupply, 
    transferTokens,
    loadWallet 
} from '../services/tokenService.js';

dotenv.config();

const app = express();
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
    const safeData = JSON.parse(JSON.stringify(data, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
    return originalJson.call(this, safeData);
    };
    next();
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store the managed wallet address (loaded on startup)
let managedWallet = null;
let managedAddress = null;

// In-memory storage for user credits 
const userCredits = new Map();

// using nonces (prevent replay attacks)
const usedNonces = new Set();


async function initializeWallet() {
    try {
        managedWallet = await loadWallet();
        managedAddress = managedWallet.address;
        console.log(` Managed wallet initialized: ${managedAddress}`);
        
        // Log initial balance
        const balance = await getBalance(managedAddress);
        console.log(` Initial token balance: ${balance}`);
    } catch (error) {
        console.error(' Failed to initialize wallet:', error);
        process.exit(1);
    } 
}


function getUserCredit(userAddress) {
    return userCredits.get(userAddress.toLowerCase()) || 0;
}

function setUserCredit(userAddress, amount) {
    userCredits.set(userAddress.toLowerCase(), amount);
}


function deductUserCredit(userAddress, amount) {
    const currentCredit = getUserCredit(userAddress);
    const newCredit = currentCredit - parseFloat(amount);
    setUserCredit(userAddress, Math.max(0, newCredit));
    return newCredit;
}

// Routes

app.get('/api/wallet/info', async (req, res) => {
    try {
        const [name, symbol, decimals, balance] = await Promise.all([
            getTokenName(),
            getTokenSymbol(), 
            getTokenDecimals(),
            getBalance(managedAddress)
        ]);

        res.json({
            success: true,
            data: {
                address: managedAddress,
                tokenInfo: {
                    name: name.name,
                    symbol: symbol.symbol,
                    decimals: decimals.decimals
                },
                balance: balance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 2. Get the ruto user credit balance
app.get('/api/user/credit/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        // Basic address validation
        if (!address || !address.startsWith('0x') || address.length !== 42) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address format'
            });
        }

        const credit = getUserCredit(address);
        
        res.json({
            success: true,
            data: {
                address,
                credit: credit.toString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 3. for the sake of test, i Add credit to user 
app.post('/api/user/credit', async (req, res) => {
    try {
        const { userAddress, amount } = req.body;
        
        if (!userAddress || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userAddress, amount'
            });
        }

        const currentCredit = getUserCredit(userAddress);
        const newCredit = currentCredit + parseFloat(amount);
        setUserCredit(userAddress, newCredit);
        
        res.json({
            success: true,
            data: {
                userAddress,
                previousCredit: currentCredit,
                newCredit: newCredit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 4. GASLESS TRANSFER 
app.post('/api/transfer/gasless', async (req, res) => {
    try {
        const { userAddress, to, amount, timestamp, signature } = req.body;

        // STRICT VALIDATION - ALL FIELDS REQUIRED
        if (!userAddress || !to || !amount || !timestamp || !signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userAddress, to, amount, timestamp, signature are ALL required for gasless transfers'
            });
        }

        // Validate addresses
        if (!ethers.isAddress(userAddress)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid userAddress format'
            });
        }

        if (!ethers.isAddress(to)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid recipient address format'
            });
        }

    
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount. Must be a positive number'
            });
        }

        // using timestamp to prevent replaying 
        const currentTime = Date.now();
        const requestTime = parseInt(timestamp);
        const timeDiff = Math.abs(currentTime - requestTime);
        
        // if (timeDiff > 300000) { // 5 minutes
        //     return res.status(400).json({
        //         success: false,
        //         error: 'Request timestamp too old or too far in future'
        //     });
        //}

        // using nonce to prevent replay
        const nonce = `${userAddress}-${timestamp}-${amount}-${to}`;
        if (usedNonces.has(nonce)) {
            return res.status(400).json({
                success: false,
                error: 'Transaction already processed (replay attack prevention)'
            });
        }

        // Verify signature
        const message = `Transfer ${amount} tokens from ${userAddress} to ${to} at ${timestamp}`;
        let recoveredAddress;
        
        try {
            recoveredAddress = ethers.verifyMessage(message, signature);
        } catch (signatureError) {
            return res.status(400).json({
                success: false,
                error: 'Invalid signature format'
            });
        }

        if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
            return res.status(400).json({
                success: false,
                error: 'Signature verification failed. Message not signed by userAddress'
            });
        }

        // Check that the ruto user has enough
        const userCredit = getUserCredit(userAddress);
        if (userCredit < numAmount) {
            return res.status(400).json({
                success: false,
                error: `Insufficient credit. Available: ${userCredit}, Requested: ${amount}`
            });
        }

        // Check if service has sufficient balance
        const serviceBalance = await getBalance(managedAddress);
        if (parseFloat(serviceBalance) < numAmount) {
            return res.status(500).json({
                success: false,
                error: `Service has insufficient token balance. Available: ${serviceBalance}`
            });
        }

        // Add nonce to prevent replay
        usedNonces.add(nonce);

        // Execute the gasless transfer
        console.log(` Executing GASLESS transfer: ${amount} tokens to ${to}`);
        console.log(` Authorized by: ${userAddress} (signature verified)`);
        console.log(` Gas paid by: ${managedAddress} (SERVICE WALLET)`);
        console.log(` Message signed: "${message}"`);
        
        const txReceipt = await transferTokens(to, amount.toString());
        
        // Deduct from user's credit
        const newCredit = deductUserCredit(userAddress, amount);
        
        // Get updated service balance
        const newServiceBalance = await getBalance(managedAddress);
        
        res.json({
            success: true,
            data: {
                transactionHash: txReceipt.hash,
                blockNumber: txReceipt.blockNumber,
                gasUsed: txReceipt.gasUsed.toString(),
                gasPaidBy: managedAddress,
                authorizedBy: userAddress,
                from: managedAddress,
                to,
                amount,
                userCreditBefore: userCredit,
                userCreditAfter: newCredit,
                serviceBalance: newServiceBalance,
                isGasless: true,
                verificationDetails: {
                    signatureValid: true,
                    messageVerified: message,
                    recoveredAddress: recoveredAddress
                }
            }
        });

    } catch (error) {
        console.error(' Gasless transfer failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 5. Get token information
app.get('/api/token/info', async (req, res) => {
    try {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            getTokenName(),
            getTokenSymbol(),
            getTokenDecimals(),
            getTotalSupply()
        ]);

        res.json({
            success: true,
            data: {
                name: name.name,
                symbol: symbol.symbol,
                decimals: decimals.decimals,
                totalSupply
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 6. Health checking endpoints
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            managedAddress: managedAddress,
            totalUsers: userCredits.size,
            totalTransactions: usedNonces.size,
            isGaslessService: true,
            timestamp: new Date().toISOString()
        }
    });
});

// Error handling 
app.use((error, req, res, next) => {
    console.error(' Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handling
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// server starter 
async function startServer() {
    await initializeWallet();

    app.listen(PORT, () => {
        console.log(` TRUE GASLESS ERC-20 API server running on port ${PORT}`);
        console.log(` Health check: http://localhost:${PORT}/api/health`);
        console.log(` Managed address: ${managedAddress}`);
        console.log(` Gas Strategy: Service wallet pays ALL gas fees`);
        console.log(` Security: Signature verification + replay protection`);
        console.log(`\n Available endpoints:`);
        console.log(`   GET  /api/wallet/info`);
        console.log(`   GET  /api/user/credit/:address`);
        console.log(`   POST /api/user/credit`);
        console.log(`   POST /api/transfer/gasless (REQUIRES SIGNATURE)`);
        console.log(`   GET  /api/token/info`);
        console.log(`   GET  /api/health`);
    });
}

startServer().catch(console.error);

export default app;