from dataclasses import dataclass
from typing import Optional


@dataclass
class Transaction:
    id: int
    owner: str
    amount: int
    category: str
    note: str
    timestamp: int
    isIncome: bool
