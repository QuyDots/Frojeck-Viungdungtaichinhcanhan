// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PersonalFinance {
    struct TxItem {
        uint256 amount;
        bool income; // true = income, false = expense
        string category;
        string note;
        uint256 timestamp;
    }

    // mapping of owner => array of transactions
    mapping(address => TxItem[]) private ledger;

    event TransactionAdded(address indexed owner, uint256 index, uint256 amount, bool income, string category, string note, uint256 timestamp);

    // Cho phép gửi kèm ETH khi thêm giao dịch (msg.value)
    function addTransaction(uint256 amount, bool income, string calldata category, string calldata note) external payable {
        require(amount > 0, "Amount must be > 0");
        uint256 ts = block.timestamp;
        TxItem memory item = TxItem({
            amount: amount,
            income: income,
            category: category,
            note: note,
            timestamp: ts
        });
        ledger[msg.sender].push(item);
        uint256 idx = ledger[msg.sender].length - 1;
        emit TransactionAdded(msg.sender, idx, amount, income, category, note, ts);
    }

    function getMyTransactions() external view returns (TxItem[] memory) {
        return ledger[msg.sender];
    }

    function getTransactionCount(address owner) external view returns (uint256) {
        return ledger[owner].length;
    }
}
