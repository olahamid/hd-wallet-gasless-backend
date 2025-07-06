import { HDNodeWallet, Mnemonic, randomBytes } from "ethers";
import { writeFileSync } from "fs";
import * as fs from "fs";
import dotenv from "dotenv";
import { PROVIDER, ABI, TOKEN_CONTRACT_ADDRESS, PATH } from "../config/config.wallet.js";

dotenv.config();

// const { NETWORK, PROVIDER, PATH, TOKEN_CONTRACT_ADDRESS, ABI } = config;
function getPhrase( 
    useRandom, inputPhrase = ""
) {
    if (useRandom) {
        // generate a random mnemonic phrase
        return Mnemonic.entropyToPhrase(randomBytes(16));
    } else {
        // use the provided input phrase
        return inputPhrase;
    }
}

function getWalletFromPhrase(mnemonicPhrase, idx = 0) {
    const idxPath = `m/44'/60'/0'/0/${idx}`;
    const mnemonicObj = Mnemonic.fromPhrase(mnemonicPhrase);
    const hdWallet = HDNodeWallet.fromMnemonic(mnemonicObj, PATH);

    return hdWallet;
}

async function computeWallet() {
    // generate a random mnemonic phrase 
    const mnemonicPhrase = getPhrase(true);

    // create an hd wallet from the mnemonic phrase + path 
    const mnemonicObj = Mnemonic.fromPhrase(mnemonicPhrase);
    const hdWallet = HDNodeWallet.fromMnemonic(mnemonicObj, PATH);

    const connectedHDWallet = hdWallet.connect(PROVIDER);
    // store the private key in a json file and lock with a password
    const encryptedJson = await connectedHDWallet.encrypt("ruto-password");
    // log the first 10 addresses derived from the HD-WALLET USING THE SAME MNEMONIC PHRASE
    for (let i = 0; i < 10; i++) {
        const _path = `m/44'/60'/0'/0/${i}`;
        const wallet = HDNodeWallet.fromMnemonic(mnemonicObj, _path);
        console.log(`Wallet ${i} address:`, wallet.address);
    }

    fs.writeFileSync("wallet.json", encryptedJson);
    fs.writeFileSync("metadata.txt", `address=${connectedHDWallet.address}\nmnemonic=${mnemonicPhrase}`);
    console.log("Wallet address:", connectedHDWallet.address);
    console.log("Mnemonic phrase:", mnemonicPhrase);
    console.log("Wallet created and saved to wallet.json");
}

computeWallet(true);