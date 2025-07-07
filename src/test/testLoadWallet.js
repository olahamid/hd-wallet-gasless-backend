import { loadWallet, getPublicAddress, getPrivateKey } from "../wallet/loadWallet.js";

const FILE_PATH = "./wallet.json";
const PASSWORD = "ruto-password";

(async () => {
    try {
    const wallet = await loadWallet(FILE_PATH, PASSWORD);
    console.log(" Public Address:", getPublicAddress(wallet));
    console.log(" Private Key:", getPrivateKey(wallet));
    } catch (err) {
    console.error(" Error loading wallet:", err.message);
    }
})();