// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BlackjackWallet.sol";
import "../src/BlackjackToken.sol"; // Assuming you want to deploy BlackjackToken first

contract DeployBlackjackWallet is Script {
    function run() external returns (BlackjackWallet) {
        vm.startBroadcast();

        // Deploy BlackjackToken first (if you haven't already)
        DeployBlackjackToken deployTokenScript = new DeployBlackjackToken();
        BlackjackToken gameToken = deployTokenScript.run();
        address tokenAddress = address(gameToken); // Get the deployed token address

        // Deployment parameters for BlackjackWallet - Customize these as needed
        address gameOperatorAddress = vm.addr(2); // Example: Use a different address for game operator

        BlackjackWallet blackjackWallet = new BlackjackWallet(
            tokenAddress,
            gameOperatorAddress
        );

        vm.stopBroadcast();

        // Optional: Print the deployed contract addresses
        console.log("BlackjackToken deployed to:", tokenAddress);
        console.log("BlackjackWallet deployed to:", address(blackjackWallet));

        return blackjackWallet;
    }
}

// Import the BlackjackToken deployment script (if you want to deploy it within this script)
import "./DeployBlackjackToken.s.sol";
