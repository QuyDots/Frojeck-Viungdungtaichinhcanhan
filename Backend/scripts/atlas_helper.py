"""
Helper: Hướng dẫn lấy MongoDB Atlas connection string
"""

print("=" * 70)
print("📡 HƯỚNG DẪN LẤY MONGODB ATLAS CONNECTION STRING")
print("=" * 70)

print("\n🔗 Các bước lấy Connection String từ MongoDB Atlas:\n")

print("1️⃣  Đăng nhập MongoDB Atlas: https://cloud.mongodb.com")
print("    ↓")
print("2️⃣  Click 'DATABASE' → 'Clusters' (menu bên trái)")
print("    ↓")
print("3️⃣  Click nút 'Connect' trên cluster của bạn")
print("    ↓")
print("4️⃣  Chọn 'Connect your application'")
print("    ↓")
print("5️⃣  Driver: Python | Version: 3.12 or later")
print("    ↓")
print("6️⃣  Copy connection string")

print("\n" + "=" * 70)
print("📝 CONNECTION STRING MẪU:")
print("=" * 70)
print("""
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

⚠️  Lưu ý:
   - Thay <username> bằng database user của bạn
   - Thay <password> bằng password thực (không có < >)
   - Giữ nguyên phần còn lại
""")

print("\n" + "=" * 70)
print("🔐 TẠO DATABASE USER (nếu chưa có):")
print("=" * 70)
print("""
1. Vào 'Security' → 'Database Access'
2. Click 'Add New Database User'
3. Điền:
   - Username: financechain_user
   - Password: [Tạo password mạnh, LƯU LẠI!]
   - Role: Read and write to any database
4. Click 'Add User'
""")

print("\n" + "=" * 70)
print("🌐 CẤU HÌNH NETWORK ACCESS:")
print("=" * 70)
print("""
1. Vào 'Security' → 'Network Access'
2. Click 'Add IP Address'
3. Chọn 'Allow Access from Anywhere' → 0.0.0.0/0
4. Click 'Confirm'
5. Đợi 1-2 phút để apply
""")

print("\n" + "=" * 70)
print("📄 CẬP NHẬT FILE .env:")
print("=" * 70)

import os
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
env_exists = os.path.exists(env_path)

if env_exists:
    print(f"✓ File .env đã tồn tại: {env_path}")
    print("\nMở file và cập nhật MONGO_URI:")
else:
    print(f"⚠ File .env chưa tồn tại: {env_path}")
    print("\nTạo file .env với nội dung:")

print("""
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=financechain
PORT=5000
HOST=127.0.0.1
""")

print("\n" + "=" * 70)
print("✅ SAU KHI CẬP NHẬT .env:")
print("=" * 70)
print("""
Chạy các lệnh sau để test:

cd Backend
.venv\\Scripts\\Activate.ps1
python scripts/test_connection.py
python scripts/create_sample_data.py
uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload
""")

print("\n" + "=" * 70)
print("🆘 CẦN GIÚP?")
print("=" * 70)
print("""
- Xem chi tiết: Backend/ATLAS_SETUP.md
- Test connection: python scripts/test_connection.py
- Video guide: https://www.youtube.com/watch?v=rPqRyYJmx2g
""")

print("=" * 70)
print("✨ Chúc bạn thành công!")
print("=" * 70)
