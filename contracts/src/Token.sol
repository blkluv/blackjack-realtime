// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BlackjackToken is ERC20Burnable, AccessControl {
    // Create roles for access control
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Token decimals
    uint8 private immutable _decimals;

    // Events
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);

    /**
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param tokenDecimals The number of decimals for the token
     * @param initialSupply The initial supply of tokens to mint
     * @param initialHolder The address to receive the initial supply
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 tokenDecimals,
        uint256 initialSupply,
        address initialHolder
    ) ERC20(name, symbol) {
        _decimals = tokenDecimals;

        // Setup roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);

        // Mint initial supply
        if (initialSupply > 0 && initialHolder != address(0)) {
            _mint(initialHolder, initialSupply * (10 ** tokenDecimals));
        }
    }

    /**
     * @dev Returns the number of decimals used for token display
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mints tokens to a specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from a specified address (must have allowance)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(
        address from,
        uint256 amount
    ) public override onlyRole(BURNER_ROLE) {
        super.burnFrom(from, amount);
    }

    /**
     * @dev Add a new minter to the contract
     * @param minter Address of the minter to add
     */
    function addMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, minter);
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter from the contract
     * @param minter Address of the minter to remove
     */
    function removeMinter(
        address minter
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, minter);
        emit MinterRemoved(minter);
    }

    /**
     * @dev Add a new burner to the contract
     * @param burner Address of the burner to add
     */
    function addBurner(address burner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(BURNER_ROLE, burner);
    }

    /**
     * @dev Remove a burner from the contract
     * @param burner Address of the burner to remove
     */
    function removeBurner(
        address burner
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(BURNER_ROLE, burner);
    }
}
