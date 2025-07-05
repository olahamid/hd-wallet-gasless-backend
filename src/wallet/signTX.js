// src/wallet/signAndSendTx.js

import { ethers } from "ethers";
import { loadWallet } from "./loadWallet.js";
import config from "../config/config.wallet.js";
import dotenv from "dotenv";

dotenv.config();

const { PROVIDER } = config;

const FILE_PATH = "./wallet.json";
const PASSWORD = "ruto-password";
const RECIPIENT = "0x000000000000000000000000000000000000dead"; // replace with desired address
const AMOUNT_ETH = "0.001"; // amount to send

async function signAndSendTransaction() {
    try {
        const wallet = await loadWallet(FILE_PATH, PASSWORD, PROVIDER);

        const balance = await PROVIDER.getBalance(wallet.address);
        console.log(" Wallet balance:", ethers.formatEther(balance), "ETH");

        const tx = {
            to: RECIPIENT,
            value: ethers.parseEther(AMOUNT_ETH),
            gasLimit: 21000,
        };

        const estimatedGas = await wallet.estimateGas(tx);
        console.log(" Estimated Gas:", estimatedGas.toString());

        const sentTx = await wallet.sendTransaction(tx);
        console.log(" TX sent! Hash:", sentTx.hash);

        const receipt = await sentTx.wait();
        console.log(" TX confirmed in block:", receipt.blockNumber);
    } catch (err) {
        console.error(" Error signing/sending TX:", err.message);
    }
}

signAndSendTransaction();
