"""
Xem dữ liệu trong MongoDB
Chạy: python scripts/view_data.py
"""

from pymongo import MongoClient
from datetime import datetime

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "financechain"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print("=" * 60)
print("📊 FINANCECHAIN - XEM DỮ LIỆU MONGODB")
print("=" * 60)

# Thống kê tổng quan
tx_count = db.transactions.count_documents({})
block_count = db.blocks.count_documents({})

print(f"\n📈 Thống kê:")
print(f"  • Tổng giao dịch: {tx_count}")
print(f"  • Tổng blocks: {block_count}")

if tx_count > 0:
    total_amount = sum(tx['amount'] for tx in db.transactions.find())
    print(f"  • Tổng số tiền: ${total_amount:.2f}")

# Hiển thị 10 giao dịch gần nhất
print(f"\n💳 10 Giao dịch gần nhất:")
print("-" * 60)
for tx in db.transactions.find().sort("created_at", -1).limit(10):
    created = tx.get('created_at', datetime.utcnow()).strftime('%Y-%m-%d %H:%M')
    mined = "✓" if tx.get('mined') else "⏳"
    print(f"  {mined} {tx['sender']:10s} → {tx['recipient']:10s}  ${tx['amount']:8.2f}  ({created})")

# Hiển thị blocks
print(f"\n🔗 Blocks:")
print("-" * 60)
for block in db.blocks.find().sort("index", -1).limit(5):
    timestamp = datetime.fromtimestamp(block['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
    tx_count = len(block.get('transactions', []))
    print(f"  Block #{block['index']:3d}: {tx_count} giao dịch | {timestamp}")

# Top người dùng
print(f"\n🏆 Top 5 người gửi nhiều nhất:")
print("-" * 60)
pipeline = [
    {"$group": {"_id": "$sender", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    {"$sort": {"total": -1}},
    {"$limit": 5}
]
for doc in db.transactions.aggregate(pipeline):
    print(f"  {doc['_id']:10s}: ${doc['total']:8.2f} ({doc['count']} giao dịch)")

print(f"\n🏆 Top 5 người nhận nhiều nhất:")
print("-" * 60)
pipeline = [
    {"$group": {"_id": "$recipient", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    {"$sort": {"total": -1}},
    {"$limit": 5}
]
for doc in db.transactions.aggregate(pipeline):
    print(f"  {doc['_id']:10s}: ${doc['total']:8.2f} ({doc['count']} giao dịch)")

print("\n" + "=" * 60)
print("✨ Hoàn tất!")
