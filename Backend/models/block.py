import hashlib
import json
from typing import List
try:
    from .transaction import Transaction  # package-relative import
except Exception:
    # Fallback when run without package context
    try:
        from transaction import Transaction  # type: ignore
    except Exception as e:
        raise ImportError(f"Cannot import Transaction: {e}")


class Block:
    def __init__(self, index: int, transactions: List[Transaction], previous_hash: str, timestamp: int):
        self.index = index
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.timestamp = timestamp
        self.hash = self.compute_hash()

    def compute_hash(self) -> str:
        payload = {
            "index": self.index,
            "transactions": [t.__dict__ for t in self.transactions],
            "previous_hash": self.previous_hash,
            "timestamp": self.timestamp,
        }
        block_string = json.dumps(payload, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()
