"""
Kiểm tra kết nối MongoDB
Chạy: python scripts/test_connection.py
"""

from pymongo import MongoClient
import sys
import os
from dotenv import load_dotenv

# Force reload .env
load_dotenv(override=True)

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'financechain')

print("🔍 Kiểm tra kết nối MongoDB...")
print(f"URI: {MONGO_URI}")
print(f"Database: {MONGO_DB_NAME}")
print("-" * 50)

try:
    # Kết nối với timeout 5 giây
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    
    # Test connection
    client.admin.command('ping')
    print("✅ Kết nối thành công!")
    
    # Lấy thông tin server
    server_info = client.server_info()
    print(f"\n📊 MongoDB Version: {server_info['version']}")
    
    # Kiểm tra database
    db = client[MONGO_DB_NAME]
    collections = db.list_collection_names()
    print(f"\n💾 Database: {MONGO_DB_NAME}")
    
    if collections:
        print(f"Collections: {', '.join(collections)}")
        
        # Đếm documents
        if 'transactions' in collections:
            tx_count = db.transactions.count_documents({})
            print(f"  • transactions: {tx_count} documents")
        
        if 'blocks' in collections:
            block_count = db.blocks.count_documents({})
            print(f"  • blocks: {block_count} documents")
    else:
        print("⚠️  Chưa có collections nào")
        print("💡 Chạy: python scripts/create_sample_data.py")
    
    print("\n✨ Tất cả OK! Sẵn sàng sử dụng.")
    
except Exception as e:
    print(f"\n❌ Lỗi kết nối: {e}")
    print("\n🔧 Giải pháp:")
    print("  1. Kiểm tra MongoDB đang chạy:")
    print("     Windows: Task Manager → Services → MongoDB")
    print("     Hoặc: net start MongoDB")
    print("\n  2. Nếu chưa cài MongoDB:")
    print("     https://www.mongodb.com/try/download/community")
    print("\n  3. Hoặc dùng Docker:")
    print("     docker run -d -p 27017:27017 --name mongodb mongo")
    sys.exit(1)
