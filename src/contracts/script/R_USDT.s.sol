// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import { Script, console } from "forge-std/Script.sol";

import { RUTO_AI } from "../src/RUTO_AI.sol";
/// @title RUTO_AI Script
/// @author OLA HAMID
/// @notice This script deploys the RUTO_AI contract.
contract RUTO_AI_Script is Script {
    function run() external {
        vm.startBroadcast();

        RUTO_AI rutoAI = new RUTO_AI("RUTO_AI", "RUTO_AI", 18);
        rutoAI.mint(address(this), 1000000 * 10 ** 18); // Mint 1,000,000 RUTO_AI tokens to the contract address
        rutoAI.mint(msg.sender, 1000000 * 10 ** 18); // Mint 1,000,000 RUTO_AI tokens to the sender
        console.log("RUTO_AI deployed and minted at:", address(rutoAI));

        vm.stopBroadcast();
    }
}