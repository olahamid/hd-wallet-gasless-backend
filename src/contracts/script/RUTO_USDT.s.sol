// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import { Script, console } from "forge-std/Script.sol";

import { RUTO_USDT } from "../src/RUTO_USDT.sol";


/// @title RUTO_USDT Script
/// @author OLA HAMID
/// @notice This script deploys the RUTO_USDT contract.

contract RUTO_USDT_Script is Script {
    function run() external {
        vm.startBroadcast();

        RUTO_USDT rutoUsdt = new RUTO_USDT();
        console.log("RUTO_USDT deployed at:", address(rutoUsdt));

        vm.stopBroadcast();
    }
}