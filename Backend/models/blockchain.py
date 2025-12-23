import time
from typing import List
try:
    # Support both package and standalone imports
    try:
        from .block import Block  # package-relative import
        from .transaction import Transaction
    except Exception:
        try:
            from block import Block  # type: ignore
            from transaction import Transaction  # type: ignore
        except Exception as e:
            raise ImportError(f"Cannot import Block/Transaction: {e}")
except ImportError:
    from block import Block  # type: ignore
    from transaction import Transaction  # type: ignore


class BlockChain:
    def __init__(self):
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis = Block(index=0, transactions=[], previous_hash="0", timestamp=int(time.time()))
        self.chain.append(genesis)

    def add_transaction(self, tx: Transaction):
        self.pending_transactions.append(tx)

    def mine_block(self):
        if not self.pending_transactions:
            return None
        block = Block(
            index=len(self.chain),
            transactions=self.pending_transactions.copy(),
            previous_hash=self.chain[-1].hash,
            timestamp=int(time.time()),
        )
        self.chain.append(block)
        self.pending_transactions.clear()
        return block

    def get_transactions_by_owner(self, owner: str) -> List[Transaction]:
        result: List[Transaction] = []
        for b in self.chain:
            for t in b.transactions:
                if t.owner.lower() == owner.lower():
                    result.append(t)
        for t in self.pending_transactions:
            if t.owner.lower() == owner.lower():
                result.append(t)
        return result

    def is_valid(self) -> bool:
        for i in range(1, len(self.chain)):
            prev = self.chain[i - 1]
            curr = self.chain[i]
            if curr.previous_hash != prev.hash:
                return False
            if curr.compute_hash() != curr.hash:
                return False
        return True
