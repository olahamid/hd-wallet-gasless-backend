// File: test/generateSignature.js - Generate signatures for testing
import { ethers } from 'ethers';

async function generateSignature() {
    // Create a test wallet
    const privateKey = '0x' + 'a'.repeat(64); // Replace with real private key for testing
    const wallet = new ethers.Wallet(privateKey);
    
    console.log(' Test user address:', wallet.address);
    
    // Transfer details
    const to = '0x52102c90aFc51Eb171fa08bB56c892B46bD91177';
    const amount = '100';
    const timestamp = Date.now();
    
    // Create message to sign
    const message = `Transfer ${amount} tokens from ${wallet.address} to ${to} at ${timestamp}`;
    
    // Sign the message
    const signature = await wallet.signMessage(message);
    
    console.log('\n Generated signature data:');
    console.log('Message:', message);
    console.log('Signature:', signature);
    console.log('Timestamp:', timestamp);
    
    // Create the complete request object
    const requestData = {
        userAddress: wallet.address,
        to: to,
        amount: amount,
        timestamp: timestamp,
        signature: signature
    };
    
    console.log('\n Complete request object:');
    console.log(JSON.stringify(requestData, null, 2));
    
    // Generate curl command
    const curlCommand = `curl -X POST http://localhost:3000/api/transfer/gasless \\
    -H "Content-Type: application/json" \\
    -d '${JSON.stringify(requestData)}'`;
    
    console.log('\n Curl command:');
    console.log(curlCommand);
    
    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    console.log('\n Signature verification:');
    console.log('Original address:', wallet.address);
    console.log('Recovered address:', recoveredAddress);
    console.log('Valid:', recoveredAddress.toLowerCase() === wallet.address.toLowerCase());
    
    return requestData;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateSignature().catch(console.error);
}

export { generateSignature };