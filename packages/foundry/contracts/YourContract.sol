// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title YourContract
 * @dev Placeholder contract for Scaffold-ETH 2 compatibility
 */
contract YourContract {
    address public immutable owner;
    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint256) public userGreetingCounter;

    event GreetingChange(
        address indexed greetingSetter,
        string newGreeting,
        bool premium,
        uint256 value
    );

    constructor(address _owner) {
        owner = _owner;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    function setGreeting(string memory _newGreeting) public payable {
        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        premium = msg.value > 0;

        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
    }

    function withdraw() public isOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    receive() external payable {}
}