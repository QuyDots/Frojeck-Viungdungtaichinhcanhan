"""
Script để tạo dữ liệu mẫu trong MongoDB cho FinanceChain
Chạy: python scripts/create_sample_data.py
"""

from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import time

# Kết nối MongoDB
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "financechain"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Xóa dữ liệu cũ (nếu muốn bắt đầu lại)
print("🗑️  Xóa dữ liệu cũ...")
db.transactions.delete_many({})
db.blocks.delete_many({})

# Danh sách tên để tạo giao dịch
users = ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Henry"]
categories = ["Lương", "Thưởng", "Ăn uống", "Mua sắm", "Giải trí", "Đầu tư", "Tiết kiệm"]

print("\n💰 Tạo giao dịch mẫu...")

# Tạo 20 giao dịch ngẫu nhiên
transactions = []
for i in range(20):
    sender = random.choice(users)
    recipient = random.choice([u for u in users if u != sender])
    amount = round(random.uniform(10, 1000), 2)
    
    tx = {
        "sender": sender,
        "recipient": recipient,
        "amount": amount,
        "mined": True,
        "created_at": datetime.utcnow() - timedelta(days=random.randint(0, 30))
    }
    transactions.append(tx)
    print(f"  ✓ {sender} → {recipient}: ${amount}")

# Insert transactions
result = db.transactions.insert_many(transactions)
print(f"\n✅ Đã tạo {len(result.inserted_ids)} giao dịch")

# Tạo blocks (nhóm giao dịch thành blocks)
print("\n🔗 Tạo blocks...")
block_size = 5  # Mỗi block chứa 5 giao dịch

for i in range(0, len(transactions), block_size):
    block_txs = transactions[i:i+block_size]
    block = {
        "index": i // block_size,
        "timestamp": time.time() - (len(transactions) - i) * 3600,
        "transactions": block_txs,
        "created_at": datetime.utcnow() - timedelta(hours=len(transactions) - i)
    }
    db.blocks.insert_one(block)
    print(f"  ✓ Block #{block['index']}: {len(block_txs)} giao dịch")

print(f"\n✅ Đã tạo {(len(transactions) + block_size - 1) // block_size} blocks")

# Thống kê
print("\n📊 Thống kê:")
print(f"  • Tổng giao dịch: {db.transactions.count_documents({})}")
print(f"  • Tổng blocks: {db.blocks.count_documents({})}")
print(f"  • Tổng số tiền: ${sum(tx['amount'] for tx in transactions):.2f}")

# Top người gửi nhiều nhất
print("\n🏆 Top người gửi:")
pipeline = [
    {"$group": {"_id": "$sender", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    {"$sort": {"total": -1}},
    {"$limit": 5}
]
for doc in db.transactions.aggregate(pipeline):
    print(f"  • {doc['_id']}: ${doc['total']:.2f} ({doc['count']} giao dịch)")

print("\n✨ Hoàn tất! Khởi động Backend để xem dữ liệu.")
print("   Frontend: http://127.0.0.1:5173")
print("   Backend API: http://127.0.0.1:5000/api/transactions")
