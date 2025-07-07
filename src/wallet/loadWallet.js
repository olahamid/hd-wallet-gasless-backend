// File: src/wallet/loadWallet.js
import { readFileSync } from "fs";
import * as fs from "fs";
import { ethers, HDNodeWallet, Mnemonic } from "ethers";
import { Wallet } from "ethers";

import dotenv from "dotenv";
import { PROVIDER, ABI, TOKEN_CONTRACT_ADDRESS, PATH } from "../config/config.wallet.js";

dotenv.config();

// const { NETWORK, PROVIDER, PATH, TOKEN_CONTRACT_ADDRESS, ABI } = config;

/**
 * Load an HD wallet from a JSON file.
 * @param {*} filePath - The path to the wallet JSON file.
 * @param {*} password - The password to decrypt the wallet.
 * @returns {Promise<HDNodeWallet>} - The loaded HD wallet.
 */
export async function loadWallet(filePath, password, provider) {
    try {
        // Read the encrypted wallet JSON file
        const encryptedJson = readFileSync(filePath, "utf8");
        //const wallet = await HDNodeWallet.fromEncryptedJson(encryptedJson, password);
        const wallet = await Wallet.fromEncryptedJson(encryptedJson, password);
        
        return  wallet.connect(PROVIDER);
    } catch (error) {
        console.error("Error loading wallet:", error);
        throw error;
    }
}
/**
 * Get the public address of the wallet.
 * @param {*} wallet - The HD wallet.
 * @returns {string} - The public address of the wallet.
 */
export function getPublicAddress(wallet) {
    return wallet.address;
} 

/**
 * Get the private key of the wallet.
 * @param {*} wallet - The HD wallet.
 * @returns {string} - The private key of the wallet.
 */
export function getPrivateKey(wallet) {
    return wallet.privateKey;
}



