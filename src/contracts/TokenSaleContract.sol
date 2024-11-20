// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicTokenSale is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public tokenPrice; // Price of 1 token in wei

    bool public presaleActive;
    bool public emergencyStop;
    uint256 public initialTokenAmount;
    event PresaleStatusChanged(bool isActive);
    event EmergencyStopActivated(bool status);
    event TokenPriceUpdated(uint256 newPrice);
    event TokensWithdrawn(uint256 amount);
    event FundsWithdrawn(uint256 amount);
    event PurchaseFailure(
        address indexed buyer,
        string reason,
        uint256 attemptedAmount,
        uint256 contractTokenBalance,
        uint256 msgValue
    );

    constructor(address _token, uint256 _tokenPrice) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_tokenPrice > 0, "Invalid token price");

        token = IERC20(_token);
        tokenPrice = _tokenPrice;
        emergencyStop = true; // Start paused for safety
    }

    modifier whenNotStopped() {
        require(!emergencyStop, "Contract is paused");
        _;
    }

    function startPresale() external onlyOwner {
        require(initialTokenAmount > 0, "Initial token amount not set");
        presaleActive = true;
        emergencyStop = false; // Automatically unpause when starting
        emit PresaleStatusChanged(true);
    }

    function stopPresale() external onlyOwner {
        presaleActive = false;
        emit PresaleStatusChanged(false);
    }

    function setEmergencyStop(bool _status) external onlyOwner {
        emergencyStop = _status;
        emit EmergencyStopActivated(_status);
    }

    function setInitialTokenAmount() external onlyOwner {
        require(initialTokenAmount == 0, "Initial amount already set");
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens in contract");
        initialTokenAmount = balance;
    }

    event TokensPurchased(
        address indexed buyer,
        uint256 tokenAmount,
        uint256 cost,
        uint256 excess
    );

    function buyTokens(uint256 _tokenAmount) external payable nonReentrant {
    // Check presale status and input
    require(presaleActive, "Presale not active");
    require(_tokenAmount > 0, "Token amount must be positive");

    // Get the total cost and available tokens
    uint256 cost = calculateCost(_tokenAmount);
    uint256 contractTokenBalance = token.balanceOf(address(this));
    
    // Validate token availability and payment sufficiency
    require(_tokenAmount <= contractTokenBalance, "Insufficient tokens available");
    require(msg.value >= cost, "Insufficient payment");

    // Transfer tokens to the buyer
    token.safeTransfer(msg.sender, _tokenAmount);

    // Refund excess payment if applicable
    uint256 excess = msg.value - cost;

    // Emit purchase event
    emit TokensPurchased(msg.sender, _tokenAmount, cost, excess);
}


    function setTokenPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Invalid token price");
        // Optional: Add maximum price cap
        require(_newPrice <= 1e27, "Price too high"); // Example cap
        tokenPrice = _newPrice;
        emit TokenPriceUpdated(_newPrice);
    }

    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(!presaleActive || emergencyStop, "Presale is still active");
        require(
            _amount <= token.balanceOf(address(this)),
            "Insufficient token balance"
        );

        token.safeTransfer(owner(), _amount);
        emit TokensWithdrawn(_amount);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Failed to send funds");
        emit FundsWithdrawn(balance);
    }

    // View functions
    function getTokenPrice() public view returns (uint256) {
        return tokenPrice;
    }

    function calculateCost(uint256 _tokenAmount) public view returns (uint256) {
        uint256 decimalMultiplier = 10**18;
        return (_tokenAmount * tokenPrice) / decimalMultiplier;
    }

    function getAvailableTokens() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getContractBalance()
        external
        view
        returns (uint256 tokenBalance, uint256 nativeBalance)
    {
        tokenBalance = token.balanceOf(address(this));
        nativeBalance = address(this).balance;
        return (tokenBalance, nativeBalance);
    }
}
