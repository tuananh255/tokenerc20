// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XU_Token is ERC20 {
    constructor() ERC20("XU TOKEN", "XU") {
        _mint(msg.sender, 3333333 * 10 ** 18);
    }

    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= balanceOf(msg.sender), "Insufficient balance");

        _transfer(msg.sender, to, amount);

        return true;
    }
}
