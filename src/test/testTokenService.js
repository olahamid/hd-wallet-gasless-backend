// File: src/services/testTokenService.js
import {
    getTokenName,
    getTokenSymbol,
    getTokenDecimals,
    getBalance,
    getTotalSupply,
    transferTokens,
    depositETH,
    loadWallet
} from '../services/tokenService.js';

const address = "0xecd514994Dc2DA214CFf747885BE2e177f97172e";

async function runTests() {
  console.log(await getTokenName());       // → { name: 'Ruto_USDT' }
  console.log(await getTokenSymbol());     // → { symbol: 'R_USDT' }
  console.log(await getTokenDecimals());   // → { decimals: 6 }

    const balance = await getBalance(address);
  console.log("Balance:", balance);        // → e.g., '1000.0'

    const supply = await getTotalSupply();
  console.log("Total Supply:", supply);    // → e.g., '1000000.0'

    const deposit = await depositETH("0.005"); // sends 0.005 ETH to the contract
    console.log("Deposit TX:", deposit);     // → e.g., { hash: '

    const tx = await transferTokens("0x52102c90aFc51Eb171fa08bB56c892B46bD91177", "0.005"); // sends RUTO_USDT
    console.log("Transfer TX:", tx);
}

runTests().catch(console.error);
