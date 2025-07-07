// File: client-demo.js - How users interact with your gasless system
import { ethers } from 'ethers';

// Client-side functions for gasless transactions
class GaslessClient {
    constructor(apiBaseUrl = 'http://localhost:3000') {
        this.apiBaseUrl = apiBaseUrl;
    }

    /**
     * Create a signed gasless transfer request
     * @param {ethers.Wallet} userWallet - User's wallet (doesn't need ETH)
     * @param {string} to - Recipient address
     * @param {string} amount - Amount to transfer
     * @returns {Object} Signed transfer request
     */
    async createSignedTransfer(userWallet, to, amount) {
        const timestamp = Date.now();
        const message = `Transfer ${amount} tokens from ${userWallet.address} to ${to} at ${timestamp}`;
        
        // User signs message (NO GAS NEEDED)
        const signature = await userWallet.signMessage(message);
        
        return {
            userAddress: userWallet.address,
            to: to,
            amount: amount,
            timestamp: timestamp,
            signature: signature
        };
    }

    /**
     * Execute a gasless transfer
     * @param {Object} signedTransfer - Signed transfer request
     * @returns {Promise<Object>} Transaction result
     */
    async executeGaslessTransfer(signedTransfer) {
        const response = await fetch(`${this.apiBaseUrl}/api/transfer/gasless`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signedTransfer)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Transfer failed');
        }
        
        return result;
    }

    /**
     * Get user's credit balance
     * @param {string} userAddress - User's address
     * @returns {Promise<string>} Credit balance
     */
    async getUserCredit(userAddress) {
        const response = await fetch(`${this.apiBaseUrl}/api/user/credit/${userAddress}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to get credit');
        }
        
        return result.data.credit;
    }

    /**
     * Add credit to user (for testing)
     * @param {string} userAddress - User's address
     * @param {string} amount - Amount to add
     * @returns {Promise<Object>} Result
     */
    async addUserCredit(userAddress, amount) {
        const response = await fetch(`${this.apiBaseUrl}/api/user/credit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userAddress, amount })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add credit');
        }
        
        return result;
    }

    /**
     * Get service info
     * @returns {Promise<Object>} Service information
     */
    async getServiceInfo() {
        const response = await fetch(`${this.apiBaseUrl}/api/wallet/info`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to get service info');
        }
        
        return result.data;
    }
}

// Demo usage
async function demonstrateGaslessTransfer() {
    console.log(' Starting Gasless Transfer Demo');
    
    // Initialize client
    const client = new GaslessClient();
    
    // Create a user wallet (doesn't need ETH for gas)
    const userWallet = new ethers.Wallet('0x' + 'a'.repeat(64)); // Replace with real private key
    console.log(` User wallet: ${userWallet.address}`);
    
    try {
        // 1. Check service info
        const serviceInfo = await client.getServiceInfo();
        console.log(' Service Info:', serviceInfo);
        
        // 2. Add some credit to user (for testing)
        console.log('\n Adding credit to user...');
        await client.addUserCredit(userWallet.address, '1000');
        
        // 3. Check user credit
        const userCredit = await client.getUserCredit(userWallet.address);
        console.log(` User credit: ${userCredit}`);
        
        // 4. Create signed transfer
        console.log('\n Creating signed transfer...');
        const signedTransfer = await client.createSignedTransfer(
            userWallet,
            '0x52102c90aFc51Eb171fa08bB56c892B46bD91177', // recipient
            '100' // amount
        );
        
        console.log(' Signed transfer:', {
            userAddress: signedTransfer.userAddress,
            to: signedTransfer.to,
            amount: signedTransfer.amount,
            signature: signedTransfer.signature.substring(0, 20) + '...'
        });
        
        // 5. Execute gasless transfer
        console.log('\n Executing gasless transfer...');
        const result = await client.executeGaslessTransfer(signedTransfer);
        
        console.log(' Transfer successful!');
        console.log(' Transaction details:', {
            hash: result.data.transactionHash,
            gasPaidBy: result.data.gasPaidBy,
            authorizedBy: result.data.authorizedBy,
            amount: result.data.amount,
            userCreditAfter: result.data.userCreditAfter
        });
        
        // 6. Check updated credit
        const updatedCredit = await client.getUserCredit(userWallet.address);
        console.log(` Updated user credit: ${updatedCredit}`);
        
    } catch (error) {
        console.error(' Demo failed:', error.message);
    }
}

// Export for use
export { GaslessClient, demonstrateGaslessTransfer };

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    demonstrateGaslessTransfer();
}