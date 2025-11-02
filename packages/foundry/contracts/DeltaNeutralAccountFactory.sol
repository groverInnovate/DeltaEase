// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "./DeltaNeutralAccount.sol";

/**
 * @title DeltaNeutralAccountFactory
 * @dev Factory contract for deploying DeltaNeutralAccount instances
 */
contract DeltaNeutralAccountFactory {
    using Clones for address;

    // The implementation contract address
    address public immutable accountImplementation;
    IEntryPoint public immutable entryPoint;

    event AccountCreated(address indexed account, address indexed owner);

    /**
     * @dev Constructor deploys the implementation contract
     * @param entryPoint_ The EntryPoint contract address
     */
    constructor(IEntryPoint entryPoint_) {
        entryPoint = entryPoint_;
        accountImplementation = address(new DeltaNeutralAccount(entryPoint_));
    }

    /**
     * @dev Create a new account for an owner
     * @param owner The owner of the new account
     * @param salt Additional salt for account address derivation
     * @return The address of the newly created account
     */
    function createAccount(address owner, uint256 salt) external returns (address) {
        address account = getAddress(owner, salt);
        
        // If account already exists, return its address
        if (account.code.length > 0) {
            return account;
        }

        // Deploy the account using CREATE2
        address deployed = Clones.cloneDeterministic(
            accountImplementation, 
            _getSalt(owner, salt)
        );
        
        // Initialize the account
        DeltaNeutralAccount(payable(deployed)).initialize(owner);

        emit AccountCreated(deployed, owner);
        return deployed;
    }

    /**
     * @dev Calculate the address of an account that would be created with the given parameters
     */
    function getAddress(address owner, uint256 salt) public view returns (address) {
        return Clones.predictDeterministicAddress(
            accountImplementation,
            _getSalt(owner, salt),
            address(this)
        );
    }

    function _getSalt(address owner, uint256 salt) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(owner, salt));
    }
}