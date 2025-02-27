// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BlackjackToken.sol";

contract DeployBlackjackToken is Script {
    function run() external returns (BlackjackToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address initialHolder = vm.envAddress("INITIAL_HOLDER");

        // If INITIAL_HOLDER isn't set, use the deployer address
        if (initialHolder == address(0)) {
            initialHolder = vm.addr(deployerPrivateKey);
        }

        vm.startBroadcast(deployerPrivateKey);

        // Deployment parameters
        string memory tokenName = "Blackjack Token";
        string memory tokenSymbol = "BJT";
        uint8 tokenDecimals = 18;
        uint256 initialSupply = 1000000; // 1 Million

        BlackjackToken blackjackToken = new BlackjackToken(
            tokenName,
            tokenSymbol,
            tokenDecimals,
            initialSupply,
            initialHolder
        );

        vm.stopBroadcast();

        console.log("BlackjackToken deployed to:", address(blackjackToken));
        console.log("Initial tokens sent to:", initialHolder);

        return blackjackToken;
    }
}
