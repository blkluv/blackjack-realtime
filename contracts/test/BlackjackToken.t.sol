// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BlackjackToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

contract BlackjackTokenTest is Test {
    BlackjackToken public blackjackToken;
    address public deployer;
    address public initialHolder;
    address public minter;
    address public burner;
    address public user;

    string public constant TOKEN_NAME = "Blackjack Token";
    string public constant TOKEN_SYMBOL = "BJT";
    uint8 public constant TOKEN_DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 1000;

    // Declare the events here, matching the definitions in BlackjackToken.sol
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);

    function setUp() public {
        deployer = vm.addr(1);
        initialHolder = vm.addr(2);
        minter = vm.addr(3);
        burner = vm.addr(4);
        user = vm.addr(5);

        vm.startPrank(deployer);
        blackjackToken = new BlackjackToken(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            TOKEN_DECIMALS,
            INITIAL_SUPPLY,
            initialHolder
        );
        vm.stopPrank();
    }

    function testDeployment() public view {
        assertEq(blackjackToken.name(), TOKEN_NAME, "Token name is incorrect");
        assertEq(
            blackjackToken.symbol(),
            TOKEN_SYMBOL,
            "Token symbol is incorrect"
        );
        assertEq(
            blackjackToken.decimals(),
            TOKEN_DECIMALS,
            "Token decimals is incorrect"
        );
        assertEq(
            blackjackToken.totalSupply(),
            INITIAL_SUPPLY * (10 ** TOKEN_DECIMALS),
            "Initial supply is incorrect"
        );
        assertEq(
            blackjackToken.balanceOf(initialHolder),
            INITIAL_SUPPLY * (10 ** TOKEN_DECIMALS),
            "Initial holder balance is incorrect"
        );

        assertTrue(
            blackjackToken.hasRole(
                blackjackToken.DEFAULT_ADMIN_ROLE(),
                deployer
            ),
            "Deployer is not default admin"
        );
        assertTrue(
            blackjackToken.hasRole(blackjackToken.MINTER_ROLE(), deployer),
            "Deployer is not minter"
        );
        assertTrue(
            blackjackToken.hasRole(blackjackToken.BURNER_ROLE(), deployer),
            "Deployer is not burner"
        );
    }

    function testMint() public {
        uint256 mintAmount = 100;

        // Only minter can mint
        vm.startPrank(user);
        vm.expectRevert("AccessControl: account is missing role");
        blackjackToken.mint(user, mintAmount);
        vm.stopPrank();

        // Deployer (minter role initially) can mint
        vm.startPrank(deployer);
        blackjackToken.mint(minter, mintAmount);
        vm.stopPrank();
        assertEq(
            blackjackToken.balanceOf(minter),
            mintAmount,
            "Minter balance after mint incorrect"
        );
        assertEq(
            blackjackToken.totalSupply(),
            (INITIAL_SUPPLY + mintAmount) * (10 ** TOKEN_DECIMALS),
            "Total supply after mint incorrect"
        );

        // Added minter can mint
        vm.startPrank(deployer);
        blackjackToken.addMinter(minter);
        vm.stopPrank();

        vm.startPrank(minter);
        blackjackToken.mint(user, mintAmount);
        vm.stopPrank();
        assertEq(
            blackjackToken.balanceOf(user),
            mintAmount,
            "User balance after minter mint incorrect"
        );
    }

    function testBurnFrom() public {
        uint256 burnAmount = 50;

        // Approve burner to burn from initial holder
        vm.startPrank(initialHolder);
        IERC20(address(blackjackToken)).approve(burner, burnAmount);
        vm.stopPrank();

        // Only burner can burnFrom
        vm.startPrank(user);
        vm.expectRevert("AccessControl: account is missing role");
        blackjackToken.burnFrom(initialHolder, burnAmount);
        vm.stopPrank();

        // Deployer (burner role initially) can burnFrom
        vm.startPrank(deployer);
        blackjackToken.burnFrom(initialHolder, burnAmount);
        vm.stopPrank();
        assertEq(
            blackjackToken.balanceOf(initialHolder),
            (INITIAL_SUPPLY - burnAmount) * (10 ** TOKEN_DECIMALS),
            "Initial holder balance after deployer burn incorrect"
        );
        assertEq(
            blackjackToken.totalSupply(),
            (INITIAL_SUPPLY - burnAmount) * (10 ** TOKEN_DECIMALS),
            "Total supply after deployer burn incorrect"
        );

        // Add burner role and test burner can burnFrom
        vm.startPrank(deployer);
        blackjackToken.addBurner(burner);
        vm.stopPrank();

        vm.startPrank(burner);
        blackjackToken.burnFrom(initialHolder, burnAmount);
        vm.stopPrank();
        assertEq(
            blackjackToken.balanceOf(initialHolder),
            (INITIAL_SUPPLY - (2 * burnAmount)) * (10 ** TOKEN_DECIMALS),
            "Initial holder balance after burner burn incorrect"
        );
        assertEq(
            blackjackToken.totalSupply(),
            (INITIAL_SUPPLY - (2 * burnAmount)) * (10 ** TOKEN_DECIMALS),
            "Total supply after burner burn incorrect"
        );
    }

    function testAddRemoveMinter() public {
        // Only admin can add minter
        vm.startPrank(user);
        vm.expectRevert("AccessControl: account is missing role");
        blackjackToken.addMinter(minter);
        vm.stopPrank();

        // Admin can add minter
        vm.startPrank(deployer);
        blackjackToken.addMinter(minter);
        assertTrue(
            blackjackToken.hasRole(blackjackToken.MINTER_ROLE(), minter),
            "Minter role not added"
        );
        emit MinterAdded(minter);
        vm.stopPrank();

        // Only admin can remove minter
        vm.startPrank(user);
        vm.expectRevert("AccessControl: account is missing role");
        blackjackToken.removeMinter(minter);
        vm.stopPrank();

        // Admin can remove minter
        vm.startPrank(deployer);
        blackjackToken.removeMinter(minter);
        assertFalse(
            blackjackToken.hasRole(blackjackToken.MINTER_ROLE(), minter),
            "Minter role not removed"
        );
        emit MinterRemoved(minter);
        vm.stopPrank();
    }

    function testAddRemoveBurner() public {
        // Only admin can add burner
        vm.startPrank(user);
        vm.expectRevert("AccessControl: account is missing role");
        blackjackToken.addBurner(burner);
        vm.stopPrank();

        // Admin can add burner
        vm.startPrank(deployer);
        blackjackToken.addBurner(burner);
        assertTrue(
            blackjackToken.hasRole(blackjackToken.BURNER_ROLE(), burner),
            "Burner role not added"
        );
        vm.stopPrank();

        // Only admin can remove burner
        vm.startPrank(user);
        vm.expectRevert("AccessControl: account is missing role");
        blackjackToken.removeBurner(burner);
        vm.stopPrank();

        // Admin can remove burner
        vm.startPrank(deployer);
        blackjackToken.removeBurner(burner);
        assertFalse(
            blackjackToken.hasRole(blackjackToken.BURNER_ROLE(), burner),
            "Burner role not removed"
        );
        vm.stopPrank();
    }
}
