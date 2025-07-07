// File: src/server/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store the managed wallet address (loaded on startup)
let managedWallet = null;
let managedAddress = null;

// Initialize wallet on startup
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

// Routes

// 1. Get managed address info
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

// 2. Get token balance for any address
app.get('/api/token/balance/:address', async (req, res) => {
    try {
    const { address } = req.params;
    
    // Basic address validation
    if (!address || !address.startsWith('0x') || address.length !== 42) {
        return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
        });
    }

    const balance = await getBalance(address);
    
    res.json({
        success: true,
        data: {
        address,
        balance
        }
    });
    } catch (error) {
    res.status(500).json({
        success: false,
        error: error.message
    });
    }
});

// 3. Get token information
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

// 4. GASLESS TRANSFER - Main endpoint
app.post('/api/transfer/gasless', async (req, res) => {
    try {
    const { to, amount } = req.body;

    // Validation
    if (!to || !amount) {
        return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, amount'
        });
    }

    // Validate recipient address
    if (!to.startsWith('0x') || to.length !== 42) {
        return res.status(400).json({
        success: false,
        error: 'Invalid recipient address format'
        });
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
        success: false,
        error: 'Invalid amount. Must be a positive number'
        });
    }

    // Check if we have sufficient balance
    const currentBalance = await getBalance(managedAddress);
    if (parseFloat(currentBalance) < numAmount) {
        return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: ${currentBalance}, Requested: ${amount}`
        });
    }

    // Execute the gasless transfer
    // The managed wallet pays the gas fees
    console.log(` Executing gasless transfer: ${amount} tokens to ${to}`);
    
    const txReceipt = await transferTokens(to, amount.toString());
    
    // Get updated balance
    const newBalance = await getBalance(managedAddress);
    
    res.json({
        success: true,
        data: {
            transactionHash: txReceipt.hash,
            blockNumber: txReceipt.blockNumber,
            gasUsed: txReceipt.gasUsed.toString(),
            from: managedAddress,
            to,
            amount,
            newBalance
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

// 5. Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
    success: true,
    data: {
        status: 'healthy',
        managedAddress: managedAddress,
        timestamp: new Date().toISOString()
    }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(' Unhandled error:', error);
    res.status(500).json({
    success: false,
    error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
async function startServer() {
    await initializeWallet();

    app.listen(PORT, () => {
        console.log(` Gasless ERC-20 API server running on port ${PORT}`);
        console.log(` Health check: http://localhost:${PORT}/api/health`);
        console.log(` Managed address: ${managedAddress}`);
    });
}

startServer().catch(console.error);

export default app;