"""
Xóa toàn bộ dữ liệu trong MongoDB
Chạy: python scripts/clear_data.py
"""

from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "financechain"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print("⚠️  CẢNH BÁO: Script này sẽ xóa TOÀN BỘ dữ liệu!")
confirm = input("Bạn có chắc chắn? (yes/no): ")

if confirm.lower() == 'yes':
    # Xóa transactions
    tx_result = db.transactions.delete_many({})
    print(f"✓ Đã xóa {tx_result.deleted_count} transactions")
    
    # Xóa blocks
    block_result = db.blocks.delete_many({})
    print(f"✓ Đã xóa {block_result.deleted_count} blocks")
    
    print("\n✅ Đã xóa toàn bộ dữ liệu!")
    print("💡 Chạy create_sample_data.py để tạo dữ liệu mới")
else:
    print("❌ Đã hủy")
