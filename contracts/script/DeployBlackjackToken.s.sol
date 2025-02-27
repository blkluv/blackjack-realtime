// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BlackjackToken.sol";

contract DeployBlackjackToken is Script {
    function run() external returns (BlackjackToken) {
        vm.startBroadcast();

        // Deployment parameters - Customize these as needed
        string memory tokenName = "Blackjack Token";
        string memory tokenSymbol = "BJT";
        uint8 tokenDecimals = 18;
        uint256 initialSupply = 1000000; // Example: 1 Million initial supply
        address initialHolder = vm.addr(1); // Example: Deployer address as initial holder

        BlackjackToken blackjackToken = new BlackjackToken(
            tokenName,
            tokenSymbol,
            tokenDecimals,
            initialSupply,
            initialHolder
        );

        vm.stopBroadcast();

        // Optional: Print the deployed contract address
        console.log("BlackjackToken deployed to:", address(blackjackToken));

        return blackjackToken;
    }
}
