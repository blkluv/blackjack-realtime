// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BlackjackVault.sol";
import "../src/BlackjackToken.sol"; // Assuming you have BlackjackToken for testing
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BlackjackVaultTest is Test {
    BlackjackVault public blackjackVault;
    BlackjackToken public gameToken; // Deploy a mock token for testing
    address public deployer;
    address public player1;
    address public player2;
    address public gameOperator;
    address public attacker;

    function setUp() public {
        deployer = vm.addr(1);
        player1 = vm.addr(2);
        player2 = vm.addr(3);
        gameOperator = vm.addr(4);
        attacker = vm.addr(5);

        vm.startPrank(deployer);
        gameToken = new BlackjackToken(
            "Game Token",
            "GTK",
            18,
            1000000,
            deployer
        ); // Deploy a mock token
        blackjackVault = new BlackjackVault(address(gameToken), gameOperator);
        vm.stopPrank();

        // Mint some tokens to players for testing deposit/withdraw
        vm.startPrank(deployer);
        gameToken.mint(player1, 1000);
        gameToken.mint(player2, 500);
        vm.stopPrank();
    }

    function testDeployment() public view {
        assertEq(
            blackjackVault.getGameOperator(),
            gameOperator,
            "Game operator address incorrect"
        );
        assertEq(blackjackVault.owner(), deployer, "Owner address incorrect");
    }

    function testSetGameOperator() public {
        address newOperator = vm.addr(6);

        // Only owner can set game operator
        vm.startPrank(player1);
        vm.expectRevert("Ownable: caller is not the owner");
        blackjackVault.setGameOperator(newOperator);
        vm.stopPrank();

        // Owner can set game operator
        vm.startPrank(deployer);
        blackjackVault.setGameOperator(newOperator);
        vm.stopPrank();
        assertEq(
            blackjackVault.gameOperator(),
            newOperator,
            "Game operator address not updated"
        );
    }

    function testDeposit() public {
        uint256 depositAmount = 100;

        // Approve BlackjackVault to transferFrom player1
        vm.startPrank(player1);
        gameToken.approve(address(blackjackVault), depositAmount);
        vm.stopPrank();

        // Deposit tokens
        vm.startPrank(player1);
        blackjackVault.deposit(depositAmount);
        vm.stopPrank();

        assertEq(
            blackjackVault.balances(player1),
            depositAmount,
            "Player1 balance not updated after deposit"
        );
        assertEq(
            gameToken.balanceOf(address(blackjackVault)),
            depositAmount,
            "Wallet token balance not updated after deposit"
        );
        assertEq(
            gameToken.balanceOf(player1),
            1000 - depositAmount,
            "Player1 token balance not updated after deposit"
        );

        // Deposit zero amount should revert
        vm.startPrank(player1);
        vm.expectRevert("Amount must be greater than 0");
        blackjackVault.deposit(0);
        vm.stopPrank();
    }

    function testWithdraw() public {
        uint256 depositAmount = 200;
        uint256 withdrawAmount = 100;

        // Player1 deposits tokens first
        vm.startPrank(player1);
        gameToken.approve(address(blackjackVault), depositAmount);
        blackjackVault.deposit(depositAmount);
        vm.stopPrank();

        // Withdraw tokens
        vm.startPrank(player1);
        blackjackVault.withdraw(withdrawAmount);
        vm.stopPrank();

        assertEq(
            blackjackVault.balances(player1),
            depositAmount - withdrawAmount,
            "Player1 balance not updated after withdraw"
        );
        assertEq(
            gameToken.balanceOf(address(blackjackVault)),
            depositAmount - withdrawAmount,
            "Wallet token balance not updated after withdraw"
        );
        assertEq(
            gameToken.balanceOf(player1),
            1000 - depositAmount + withdrawAmount,
            "Player1 token balance not updated after withdraw"
        );

        // Withdraw zero amount should revert
        vm.startPrank(player1);
        vm.expectRevert("Amount must be greater than 0");
        blackjackVault.withdraw(0);
        vm.stopPrank();

        // Withdraw more than balance should revert
        vm.startPrank(player1);
        vm.expectRevert("Insufficient balance");
        blackjackVault.withdraw(depositAmount); // Try to withdraw the initial deposit amount which is now more than balance
        vm.stopPrank();
    }

    function testUpdatePlayerBalance() public {
        uint256 newBalance = 150;
        string memory reason = "Game win";

        // Only operator or owner can update balance
        vm.startPrank(player1);
        vm.expectRevert("Not authorized");
        blackjackVault.updatePlayerBalance(player1, newBalance, reason);
        vm.stopPrank();

        // Operator can update balance
        vm.startPrank(gameOperator);
        blackjackVault.updatePlayerBalance(player1, newBalance, reason);
        vm.stopPrank();
        assertEq(
            blackjackVault.balances(player1),
            newBalance,
            "Player1 balance not updated by operator"
        );

        // Owner can update balance
        vm.startPrank(deployer);
        blackjackVault.updatePlayerBalance(player2, newBalance, reason);
        vm.stopPrank();
        assertEq(
            blackjackVault.balances(player2),
            newBalance,
            "Player2 balance not updated by owner"
        );

        // Update balance for zero address should revert
        vm.startPrank(gameOperator);
        vm.expectRevert("Invalid address");
        blackjackVault.updatePlayerBalance(address(0), newBalance, reason);
        vm.stopPrank();
    }

    function testAdjustPlayerBalance() public {
        uint256 initialBalance = 200;
        vm.startPrank(gameOperator);
        blackjackVault.updatePlayerBalance(
            player1,
            initialBalance,
            "Initial balance setup"
        );
        vm.stopPrank();

        int256 adjustAmountWin = 50;
        string memory winReason = "Game win";
        int256 adjustAmountLoss = -30;
        string memory lossReason = "Game loss";

        // Only operator or owner can adjust balance
        vm.startPrank(player1);
        vm.expectRevert("Not authorized");
        blackjackVault.adjustPlayerBalance(player1, adjustAmountWin, winReason);
        vm.stopPrank();

        // Operator can adjust balance (win)
        vm.startPrank(gameOperator);
        blackjackVault.adjustPlayerBalance(player1, adjustAmountWin, winReason);
        vm.stopPrank();
        assertEq(
            blackjackVault.balances(player1),
            initialBalance + uint256(adjustAmountWin),
            "Player1 balance not adjusted for win"
        );

        // Operator can adjust balance (loss)
        vm.startPrank(gameOperator);
        blackjackVault.adjustPlayerBalance(
            player1,
            adjustAmountLoss,
            lossReason
        );
        vm.stopPrank();
        assertEq(
            blackjackVault.balances(player1),
            initialBalance +
                uint256(adjustAmountWin) +
                uint256(adjustAmountLoss),
            "Player1 balance not adjusted for loss"
        );

        // Adjust balance for zero address should revert
        vm.startPrank(gameOperator);
        vm.expectRevert("Invalid address");
        blackjackVault.adjustPlayerBalance(
            address(0),
            adjustAmountWin,
            winReason
        );
        vm.stopPrank();

        // Adjust balance below zero (loss exceeding balance) should revert
        vm.startPrank(gameOperator);
        vm.expectRevert("Insufficient balance");
        blackjackVault.adjustPlayerBalance(
            player1,
            -int256(
                initialBalance +
                    uint256(adjustAmountWin) +
                    uint256(adjustAmountLoss) +
                    1
            ),
            lossReason
        );
        vm.stopPrank();
    }

    function testGetBalance() public {
        uint256 expectedBalance = 300;
        vm.startPrank(gameOperator);
        blackjackVault.updatePlayerBalance(
            player1,
            expectedBalance,
            "Set balance for getBalance test"
        );
        vm.stopPrank();

        assertEq(
            blackjackVault.getBalance(player1),
            expectedBalance,
            "getBalance returns incorrect balance"
        );
    }

    function testRecoverERC20() public {
        uint256 recoveryAmount = 100;

        // Send tokens directly to BlackjackVault contract
        vm.startPrank(deployer);
        gameToken.transfer(address(blackjackVault), recoveryAmount);
        vm.stopPrank();
        assertEq(
            gameToken.balanceOf(address(blackjackVault)),
            recoveryAmount,
            "Tokens not sent to wallet for recovery test"
        );

        // Only owner can recover ERC20
        vm.startPrank(player1);
        vm.expectRevert("Ownable: caller is not the owner");
        blackjackVault.recoverERC20(address(gameToken), recoveryAmount);
        vm.stopPrank();

        // Owner can recover ERC20
        vm.startPrank(deployer);
        blackjackVault.recoverERC20(address(gameToken), recoveryAmount);
        vm.stopPrank();
        assertEq(
            gameToken.balanceOf(address(blackjackVault)),
            0,
            "Wallet balance not zero after recovery"
        );
        assertEq(
            gameToken.balanceOf(deployer),
            1000000 - recoveryAmount + recoveryAmount,
            "Owner balance incorrect after recovery"
        ); // Initial supply - sent to wallet + recovered
    }

    function testReentrancyGuardDeposit() public {
        // Deploy a malicious contract that tries to re-enter deposit
        MaliciousDepositReentrantContract maliciousContract = new MaliciousDepositReentrantContract(
                address(blackjackVault),
                address(gameToken)
            );

        // Approve malicious contract to transferFrom player1
        vm.startPrank(player1);
        gameToken.approve(address(maliciousContract), 100);
        vm.stopPrank();

        // Attempt deposit via malicious contract - should revert due to reentrancy guard
        vm.startPrank(player1);
        vm.expectRevert("ReentrancyGuardReentrantCall()"); // Expect reentrancy guard to prevent re-entry
        maliciousContract.attackDeposit();
        vm.stopPrank();
    }

    function testReentrancyGuardWithdraw() public {
        // Deploy a malicious contract that tries to re-enter withdraw
        MaliciousWithdrawReentrantContract maliciousContract = new MaliciousWithdrawReentrantContract(
                address(blackjackVault),
                address(gameToken)
            );

        // Player1 deposits tokens first
        vm.startPrank(player1);
        gameToken.approve(address(blackjackVault), 200);
        blackjackVault.deposit(200);
        vm.stopPrank();

        // Attempt withdraw via malicious contract - should revert due to reentrancy guard
        vm.startPrank(player1);
        vm.expectRevert("ReentrancyGuardReentrantCall()"); // Expect reentrancy guard to prevent re-entry
        maliciousContract.attackWithdraw();
        vm.stopPrank();
    }
}

// Malicious contract for testing reentrancy in deposit
contract MaliciousDepositReentrantContract {
    BlackjackVault public blackjackVault;
    IERC20 public gameToken;

    constructor(address _blackjackVault, address _gameToken) {
        blackjackVault = BlackjackVault(_blackjackVault);
        gameToken = IERC20(_gameToken);
    }

    function attackDeposit() external {
        uint256 amount = 100;
        blackjackVault.deposit(amount);
        // Reentrant call attempt will happen within deposit function if vulnerable
    }

    function depositFallback() public payable {
        // Re-enter deposit function - this should be blocked by ReentrancyGuard
        blackjackVault.deposit(1); // Attempt re-entrant deposit
    }

    receive() external payable {
        depositFallback();
    }
}

// Malicious contract for testing reentrancy in withdraw
contract MaliciousWithdrawReentrantContract {
    BlackjackVault public blackjackVault;
    IERC20 public gameToken;

    constructor(address _blackjackVault, address _gameToken) {
        blackjackVault = BlackjackVault(_blackjackVault);
        gameToken = IERC20(_gameToken);
    }

    function attackWithdraw() external {
        uint256 amount = 100;
        blackjackVault.withdraw(amount);
        // Reentrant call attempt will happen within withdraw function if vulnerable
    }

    function withdrawFallback() public payable {
        // Re-enter withdraw function - this should be blocked by ReentrancyGuard
        blackjackVault.withdraw(1); // Attempt re-entrant withdraw
    }

    receive() external payable {
        withdrawFallback();
    }
}
