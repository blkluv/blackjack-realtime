// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BlackjackVault.sol";
import "../src/BlackjackToken.sol"; // Assuming you want to deploy BlackjackToken first

contract DeployBlackjackVault is Script {
    function run() external returns (BlackjackVault) {
        vm.startBroadcast();

        // Deploy BlackjackToken first (if you haven't already)
        // DeployBlackjackToken deployTokenScript = new DeployBlackjackToken();
        // BlackjackToken gameToken = deployTokenScript.run();
        address tokenAddress = vm.envAddress("TOKEN_ADDRESS");

        // Deployment parameters for BlackjackVault - Customize these as needed
        address gameOperatorAddress = vm.envAddress("GAME_OPERATOR_ADDRESS"); // Example: Use a different address for game operator

        BlackjackVault blackjackVault = new BlackjackVault(
            tokenAddress,
            gameOperatorAddress
        );

        vm.stopBroadcast();

        // Optional: Print the deployed contract addresses
        console.log("BlackjackToken deployed to:", tokenAddress);
        console.log("BlackjackVault deployed to:", address(blackjackVault));

        return blackjackVault;
    }
}

// Import the BlackjackToken deployment script (if you want to deploy it within this script)
import "./DeployBlackjackToken.s.sol";
