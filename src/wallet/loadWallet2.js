import { readFileSync } from "fs";
import { Wallet, ethers } from "ethers";
import dotenv from "dotenv";
import { PROVIDER, ABI, TOKEN_CONTRACT_ADDRESS, PATH } from "../config/config.wallet.js";

dotenv.config();

//const { PROVIDER } = config;

const FILE_PATH = "./wallet.json";
const PASSWORD = "ruto-password";

async function testWalletConnection() {
    try {
        const encryptedJson = readFileSync(FILE_PATH, "utf8");
        const wallet = await Wallet.fromEncryptedJson(encryptedJson, PASSWORD);
        const connectedWallet = wallet.connect(PROVIDER);

        // Directly test provider with loaded wallet address
        const balanceP = await PROVIDER.getBalance(wallet.address);
        console.log(" Provider balance lookup:", ethers.formatEther(balanceP), "ETH");

        // Now test connectedWallet
        const balance = await connectedWallet.getBalance();
        console.log(" Wallet address:", connectedWallet.address);
        console.log(" Connected Wallet Balance:", ethers.formatEther(balance), "ETH");

    } catch (err) {
        console.error(" Failed to load wallet or fetch balance:", err.message);
    }
}

testWalletConnection();
