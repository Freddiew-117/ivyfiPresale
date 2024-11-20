// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract IVYFi is ERC20, Ownable, Pausable, ERC20Burnable {
    uint8 private _decimals;
    uint256 public maxSupply; 

    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 maxSupply_) 
        ERC20(name_, symbol_) 
        Ownable(msg.sender) 
    { 
        _decimals = decimals_;
        maxSupply = maxSupply_;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Mint function with max supply check
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to the zero address");
        require(totalSupply() + amount <= maxSupply, "Max supply exceeded"); 
        _mint(to, amount);
    }
}
