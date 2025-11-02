// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockGMXRouter
 * @dev Mock implementation of GMX perpetual trading for testing delta-neutral strategies
 */
contract MockGMXRouter {
    struct Position {
        address user;
        address collateralToken;
        uint256 collateralAmount;
        uint256 positionSize;
        bool isLong;
        uint256 entryPrice;
        uint256 timestamp;
        bool isActive;
    }
    
    mapping(bytes32 => Position) public positions;
    mapping(address => bytes32[]) public userPositions;
    
    uint256 public constant ETH_PRICE = 2000e30;
    uint256 public constant FUNDING_RATE = 100;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    uint256 private positionCounter;
    
    event PositionCreated(
        bytes32 indexed key,
        address indexed user,
        address collateralToken,
        uint256 collateralAmount,
        uint256 positionSize,
        bool isLong
    );
    
    event PositionClosed(bytes32 indexed key, address indexed user);
    event FundingPaid(bytes32 indexed key, uint256 fundingAmount);
    
    function createPosition(
        address collateralToken,
        uint256 collateralAmount,
        uint256 positionSize,
        bool isLong
    ) external returns (bytes32) {
        require(collateralAmount > 0, "Invalid collateral amount");
        require(positionSize > 0, "Invalid position size");
        
        IERC20(collateralToken).transferFrom(msg.sender, address(this), collateralAmount);
        
        bytes32 key = keccak256(abi.encodePacked(msg.sender, positionCounter++, block.timestamp));
        
        positions[key] = Position({
            user: msg.sender,
            collateralToken: collateralToken,
            collateralAmount: collateralAmount,
            positionSize: positionSize,
            isLong: isLong,
            entryPrice: ETH_PRICE,
            timestamp: block.timestamp,
            isActive: true
        });
        
        userPositions[msg.sender].push(key);
        
        emit PositionCreated(key, msg.sender, collateralToken, collateralAmount, positionSize, isLong);
        return key;
    }
    
    function closePosition(bytes32 key) external {
        Position storage position = positions[key];
        require(position.user == msg.sender, "Not position owner");
        require(position.isActive, "Position not active");
        
        uint256 fundingEarned = calculateFunding(key);
        
        IERC20(position.collateralToken).transfer(msg.sender, position.collateralAmount);
        
        if (fundingEarned > 0) {
            emit FundingPaid(key, fundingEarned);
        }
        
        position.isActive = false;
        emit PositionClosed(key, msg.sender);
    }
    
    function calculateFunding(bytes32 key) public view returns (uint256) {
        Position memory position = positions[key];
        if (!position.isActive) return 0;
        
        uint256 timeElapsed = block.timestamp - position.timestamp;
        
        if (!position.isLong) {
            return (position.positionSize * FUNDING_RATE * timeElapsed) / (10000 * SECONDS_PER_YEAR);
        }
        
        return 0;
    }
    
    function createOrder(bytes calldata orderData) external returns (bytes32) {
        return keccak256(abi.encodePacked(msg.sender, block.timestamp, orderData));
    }
    
    function cancelOrder(bytes32 key) external {
        Position storage position = positions[key];
        require(position.user == msg.sender, "Not position owner");
        
        if (position.isActive) {
            IERC20(position.collateralToken).transfer(msg.sender, position.collateralAmount);
            position.isActive = false;
            emit PositionClosed(key, msg.sender);
        }
    }
}