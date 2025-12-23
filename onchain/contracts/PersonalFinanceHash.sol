// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PersonalFinanceHash {
    event TransactionHashSaved(address indexed owner, bytes32 hash, uint256 timestamp);

    function saveTxHash(bytes32 txHash) external {
        emit TransactionHashSaved(msg.sender, txHash, block.timestamp);
    }
}
