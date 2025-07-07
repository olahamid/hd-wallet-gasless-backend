// File: src/test/gasless-test.js - Complete Test Suite
import { ethers } from 'ethers';
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

// Test user wallet 
const testUserWallet = new ethers.Wallet('0x' + '1'.repeat(64));

console.log(' Starting Gasless Transfer Test Suite');
console.log(` Test user address: ${testUserWallet.address}`);

async function test1_WithoutSignature() {
    console.log('\n TEST 1: Transfer without signature (should FAIL)');
    
    try {
        const response = await fetch(`${API_BASE}/api/transfer/gasless`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: '0x52102c90aFc51Eb171fa08bB56c892B46bD91177',
                amount: '100'
                // Missing: userAddress, signature, timestamp
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(' CRITICAL ERROR: Transfer succeeded without signature!');
            console.log(' This is NOT gasless - anyone can transfer tokens!');
            return false;
        } else {
            console.log(' CORRECT: Transfer rejected without signature');
            console.log(` Error: ${result.error}`);
            return true;
        }
    } catch (error) {
        console.log(' Test failed:', error.message);
        return false;
    }
}

async function test2_AddCredit() {
    console.log('\n TEST 2: Add credit to user');
    
    try {
        const response = await fetch(`${API_BASE}/api/user/credit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userAddress: testUserWallet.address,
                amount: '1000'
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(' Credit added successfully');
            console.log(` User credit: ${result.data.newCredit}`);
            return true;
        } else {
            console.log(' Failed to add credit:', result.error);
            return false;
        }
    } catch (error) {
        console.log(' Test failed:', error.message);
        return false;
    }
}

async function test3_GaslessTransfer() {
    console.log('\n🔍 TEST 3: Proper gasless transfer with signature');
    
    try {
        // Create signed message
        const timestamp = Date.now();
        const to = '0x52102c90aFc51Eb171fa08bB56c892B46bD91177';
        const amount = '100';
        const message = `Transfer ${amount} tokens from ${testUserWallet.address} to ${to} at ${timestamp}`;
        
        // User signs message (NO GAS REQUIRED)
        const signature = await testUserWallet.signMessage(message);
        
        console.log(' Message signed:', message);
        console.log(' Signature:', signature.substring(0, 20) + '...');
        
        // Send gasless transfer request
        const response = await fetch(`${API_BASE}/api/transfer/gasless`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userAddress: testUserWallet.address,
                to,
                amount,
                timestamp,
                signature
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(' GASLESS TRANSFER SUCCESSFUL!');
            console.log(` Transaction Details:`);
            console.log(`    Hash: ${result.data.transactionHash}`);
            console.log(`    Gas Paid By: ${result.data.gasPaidBy}`);
            console.log(`    Authorized By: ${result.data.authorizedBy}`);
            console.log(`    Amount: ${result.data.amount}`);
            console.log(`    User Credit After: ${result.data.userCreditAfter}`);
            console.log(`    Is Gasless: ${result.data.isGasless}`);
            return true;
        } else {
            console.log(' Gasless transfer failed:', result.error);
            return false;
        }
    } catch (error) {
        console.log(' Test failed:', error.message);
        return false;
    }
}

async function test4_ReplayAttack() {
    console.log('\n TEST 4: Replay attack prevention');
    
    try {
        // Try to reuse the same signature
        const timestamp = Date.now() - 1000; // Use old timestamp
        const to = '0x52102c90aFc51Eb171fa08bB56c892B46bD91177';
        const amount = '50';
        const message = `Transfer ${amount} tokens from ${testUserWallet.address} to ${to} at ${timestamp}`;
        const signature = await testUserWallet.signMessage(message);
        
        // Send first request
        const response1 = await fetch(`${API_BASE}/api/transfer/gasless`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userAddress: testUserWallet.address,
                to,
                amount,
                timestamp,
                signature
            })
        });

        const result1 = await response1.json();
        
        if (response1.ok) {
            console.log(' First transaction successful');
            
            // Try to replay the same transaction
            const response2 = await fetch(`${API_BASE}/api/transfer/gasless`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: testUserWallet.address,
                    to,
                    amount,
                    timestamp,
                    signature
                })
            });

            const result2 = await response2.json();
            
            if (response2.ok) {
                console.log(' SECURITY ISSUE: Replay attack succeeded!');
                return false;
            } else {
                console.log(' CORRECT: Replay attack prevented');
                console.log(` Error: ${result2.error}`);
                return true;
            }
        } else {
            console.log(' First transaction failed:', result1.error);
            return false;
        }
    } catch (error) {
        console.log(' Test failed:', error.message);
        return false;
    }
}

async function test5_InsufficientCredit() {
    console.log('\n TEST 5: Insufficient credit handling');
    
    try {
        const timestamp = Date.now();
        const to = '0x52102c90aFc51Eb171fa08bB56c892B46bD91177';
        const amount = '10000'; // More than user's credit
        const message = `Transfer ${amount} tokens from ${testUserWallet.address} to ${to} at ${timestamp}`;
        const signature = await testUserWallet.signMessage(message);
        
        const response = await fetch(`${API_BASE}/api/transfer/gasless`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userAddress: testUserWallet.address,
                to,
                amount,
                timestamp,
                signature
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log(' SECURITY ISSUE: Transfer exceeded user credit!');
            return false;
        } else {
            console.log(' CORRECT: Transfer rejected due to insufficient credit');
            console.log(` Error: ${result.error}`);
            return true;
        }
    } catch (error) {
        console.log(' Test failed:', error.message);
        return false;
    }
}

async function runAllTests() {
    console.log(' Running comprehensive gasless service tests...\n');
    
    const tests = [
        { name: 'Security - No Signature', test: test1_WithoutSignature },
        { name: 'Setup - Add Credit', test: test2_AddCredit },
        { name: 'Core - Gasless Transfer', test: test3_GaslessTransfer },
        { name: 'Security - Replay Prevention', test: test4_ReplayAttack },
        { name: 'Security - Credit Limit', test: test5_InsufficientCredit }
    ];
    
    const results = [];
    
    for (const { name, test } of tests) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(` Running: ${name}`);
        console.log(`${'='.repeat(50)}`);
        
        const result = await test();
        results.push({ name, passed: result });
        
        if (!result) {
            console.log(` ${name} FAILED`);
        } else {
            console.log(` ${name} PASSED`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(' FINAL TEST RESULTS');
    console.log('='.repeat(60));
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
        console.log(`${result.passed ? 'PASSED' : 'NOT PASSED'} ${result.name}`);
    });
    
    console.log(`\n Score: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log(' ALL TESTS PASSED');
    } else {
        console.log(' Some tests failed - please fix the issues above');
    }
}

// Run tests
runAllTests().catch(console.error);