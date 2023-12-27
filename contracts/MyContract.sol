// File: MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    // lấy địa chỉ ví và tiền
    function getBalance(address _address) public view returns (uint) {
        return address(_address).balance;
    }
    // chuyển tiền
    function transferEther(address payable _recipient) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        _recipient.transfer(msg.value);
    }
}