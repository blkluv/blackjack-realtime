// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BlackjackWallet is Ownable, ReentrancyGuard {
    IERC20 public gameToken;

    // Player balances
    mapping(address => uint256) public balances;

    // Backend address authorized to update balances
    address public gameOperator;

    // Events
    event Deposit(address indexed player, uint256 amount);
    event Withdrawal(address indexed player, uint256 amount);
    event BalanceUpdated(
        address indexed player,
        uint256 newBalance,
        string reason
    );

    constructor(
        address _tokenAddress,
        address _gameOperator
    )
        Ownable(msg.sender) // Call Ownable's constructor
        ReentrancyGuard() // Call ReentrancyGuard's constructor
    {
        gameToken = IERC20(_tokenAddress);
        gameOperator = _gameOperator;
    }

    modifier onlyOperator() {
        require(
            msg.sender == gameOperator || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    // Update the game operator address
    function setGameOperator(address _newOperator) external onlyOwner {
        gameOperator = _newOperator;
    }

    // Deposit tokens into the game wallet
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer tokens from player to this contract
        require(
            gameToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        // Update balance
        balances[msg.sender] += _amount;

        emit Deposit(msg.sender, _amount);
    }

    // Withdraw tokens from the game wallet
    function withdraw(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= _amount, "Insufficient balance");

        // Update balance before transfer to prevent reentrancy
        balances[msg.sender] -= _amount;

        // Transfer tokens to player
        require(gameToken.transfer(msg.sender, _amount), "Transfer failed");

        emit Withdrawal(msg.sender, _amount);
    }

    // Backend updates balance after a game (win/loss)
    function updatePlayerBalance(
        address _player,
        uint256 _newBalance,
        string calldata _reason
    ) external onlyOperator {
        require(_player != address(0), "Invalid address");

        balances[_player] = _newBalance;

        emit BalanceUpdated(_player, _newBalance, _reason);
    }

    // Add/subtract from player balance after a game
    function adjustPlayerBalance(
        address _player,
        int256 _amount,
        string calldata _reason
    ) external onlyOperator {
        require(_player != address(0), "Invalid address");

        if (_amount > 0) {
            balances[_player] += uint256(_amount);
        } else if (_amount < 0) {
            uint256 absAmount = uint256(-_amount);
            require(balances[_player] >= absAmount, "Insufficient balance");
            balances[_player] -= absAmount;
        }

        emit BalanceUpdated(_player, balances[_player], _reason);
    }

    // Get player balance
    function getBalance(address _player) external view returns (uint256) {
        return balances[_player];
    }

    // Emergency token recovery in case tokens are sent directly to contract
    function recoverERC20(
        address _tokenAddress,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_tokenAddress).transfer(owner(), _amount);
    }
}
