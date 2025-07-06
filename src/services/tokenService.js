import { readFileSync } from "fs";
import * as fs from "fs";
import { ethers, formatUnits } from "ethers";
import dotenv from "dotenv";
dotenv.config();
//import { config } from "../config/config.wallet.js"

import { PROVIDER, ABI, TOKEN_CONTRACT_ADDRESS, PATH } from "../config/config.wallet.js";

const custom_phrase = process.env.CUSTOM_PHRASE;
let wallet;
// let token_name;
// let token_symbol;
// let token_decimals;

async function loadWallet() {
    try {
        // Read the encrypted wallet JSON file
        const encryptedJson = readFileSync("./wallet.json", "utf8");
        // Load the wallet from the encrypted JSON
        wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, "ruto-password");
        // Connect the wallet to the provider
        wallet = wallet.connect(PROVIDER);
        
        console.log("Wallet loaded successfully.");
    } catch (error) {
        console.error("Error loading wallet:", error);
        throw error;
    }
    return wallet;
}

async function getTokenContract() {
    const wallet = await loadWallet();
    let tokenContract;
    tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        ABI,
        wallet
    );
    return tokenContract;
}

async function getTokenName() {
    const contract = await getTokenContract();
    const name = await contract.name();

    return {
        name
    };
}
async function getTokenSymbol() {
    const contract = await getTokenContract();
    const symbol = await contract.symbol();

    return {
        symbol
    };
}

async function getTokenDecimals() {
    const contract = await getTokenContract();
    const decimals = await contract.decimals();
    return {
        decimals
    };
}

async function getBalance(address) {
    const contract = await getTokenContract();
    const balance = await contract.balanceOf(address);
    const { decimals } = await getTokenDecimals();
    const decimal = Number(decimals);
    return formatUnits(balance, decimal);
}


async function getTotalSupply() {
    const contract = await getTokenContract();
    const totalSupply = await contract.totalSupply();
    const { decimals } = await getTokenDecimals();
    return formatUnits(totalSupply, decimals);
}

async function transferTokens(toAddress, amount) {
    const contract = await getTokenContract();
    const { decimals } = await getTokenDecimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);
    const tx = await contract.transfer(toAddress, parsedAmount);
    return await tx.wait();
}

async function depositETH(amountInEth) {
    const wallet = await loadWallet();
    const tx = await wallet.sendTransaction({
        to: TOKEN_CONTRACT_ADDRESS,
    value: ethers.parseEther(amountInEth)
    });
    return await tx.wait();

    const balance = await PROVIDER.getBalance(wallet.address);
    const valueInWei = ethers.parseEther(amountInEth);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

    if (balance < valueInWei) {
    throw new Error(`Insufficient balance. You have ${ethers.formatEther(balance)} ETH.`);
    }
}


export {
    getTokenName,
    getTokenSymbol,
    getTokenDecimals,
    getBalance,
    getTotalSupply,
    transferTokens,
    depositETH,
    loadWallet
};
