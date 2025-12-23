# 🌐 Hướng dẫn kết nối MongoDB Atlas (Cloud)

## Bạn đã có MongoDB Atlas! Làm theo các bước sau:

### Bước 1: Lấy Connection String

1. **Trên trang MongoDB Atlas** (ảnh bạn gửi):
   - Click vào **"DATABASE"** (menu bên trái)
   - Click **"Clusters"**
   - Click nút **"Connect"** trên cluster của bạn

2. **Chọn connection method:**
   - Chọn **"Connect your application"**
   - Driver: **Python**
   - Version: **3.12 or later**

3. **Copy Connection String:**
   Sẽ có dạng:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Bước 2: Cấu hình Database Access

1. Vào **"Security" → "Database Access"** (menu trái)
2. Click **"Add New Database User"**
3. Tạo user:
   - Username: `financechain_user` (hoặc tên bạn muốn)
   - Password: Tạo password mạnh (lưu lại!)
   - Database User Privileges: **"Read and write to any database"**
4. Click **"Add User"**

### Bước 3: Cấu hình Network Access

1. Vào **"Security" → "Network Access"** (menu trái)
2. Click **"Add IP Address"**
3. Chọn một trong hai:
   - **"Allow Access from Anywhere"**: `0.0.0.0/0` (dễ nhất cho dev)
   - **"Add Current IP Address"**: Chỉ IP của bạn
4. Click **"Confirm"**

### Bước 4: Cập nhật file .env

Mở file `Backend/.env` và cập nhật:

```env
# Thay <username>, <password>, <cluster-url> bằng thông tin thực của bạn
MONGO_URI=mongodb+srv://financechain_user:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB_NAME=financechain

# Backend config
PORT=5000
HOST=127.0.0.1
SEED_SAMPLE=0
```

**Ví dụ cụ thể:**
```env
MONGO_URI=mongodb+srv://myuser:Abc123456@cluster0.ab1cd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB_NAME=financechain
```

### Bước 5: Test kết nối

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
python scripts/test_connection.py
```

**Kết quả mong đợi:**
```
✅ Kết nối thành công!
📊 MongoDB Version: 7.x.x
💾 Database: financechain
```

### Bước 6: Tạo dữ liệu mẫu

```powershell
python scripts/create_sample_data.py
```

### Bước 7: Khởi động Backend

```powershell
uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload
```

---

## 🎯 Quick Setup (Copy-Paste)

```powershell
# 1. Mở Backend/.env và paste connection string từ Atlas

# 2. Test connection
cd D:\Frojeck Viungdungtaichinhcanhan\Frojeck-Viungdungtaichinhcanhan\Backend
.\.venv\Scripts\Activate.ps1
python scripts/test_connection.py

# 3. Tạo data mẫu
python scripts/create_sample_data.py

# 4. Start Backend
uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload

# 5. Start Frontend (terminal mới)
cd ../Frontend
npm run dev
```

---

## 📋 Checklist MongoDB Atlas

- [ ] Database User đã tạo (username + password)
- [ ] Network Access: `0.0.0.0/0` hoặc IP của bạn
- [ ] Connection String đã copy
- [ ] File `.env` đã cập nhật
- [ ] `test_connection.py` chạy thành công
- [ ] Dữ liệu mẫu đã tạo

---

## ❓ Troubleshooting

### Lỗi: "Authentication failed"
**Nguyên nhân:** Sai username/password hoặc user chưa được tạo

**Giải pháp:**
1. Vào **Database Access** → Xem lại username
2. Click **"Edit"** user → **"Edit Password"** → Tạo password mới
3. Copy password và cập nhật vào `.env`

### Lỗi: "Connection timeout" hoặc "No route to host"
**Nguyên nhân:** IP chưa được whitelist

**Giải pháp:**
1. Vào **Network Access**
2. Thêm `0.0.0.0/0` (allow all) hoặc IP hiện tại
3. Đợi 1-2 phút để áp dụng

### Lỗi: "Invalid connection string"
**Nguyên nhân:** Connection string không đúng format

**Giải pháp:**
1. Copy lại connection string từ Atlas
2. Đảm bảo thay `<password>` bằng password thực
3. Không có khoảng trắng thừa
4. Wrapped trong quotes nếu có ký tự đặc biệt

### Kiểm tra connection string trong Python:
```python
# Test nhanh
from pymongo import MongoClient
uri = "mongodb+srv://user:pass@cluster.mongodb.net/"
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ Connected!")
except Exception as e:
    print(f"❌ Error: {e}")
```

---

## 💡 Lợi ích MongoDB Atlas

- ✅ **Không cần cài đặt** MongoDB local
- ✅ **Free tier**: 512MB storage miễn phí
- ✅ **Auto backup**: Dữ liệu được backup tự động
- ✅ **Scalable**: Dễ dàng nâng cấp khi cần
- ✅ **Monitoring**: Charts và metrics built-in
- ✅ **Multi-region**: Deploy gần user

---

## 🔒 Security Best Practices

1. **Không commit `.env` file** lên Git
   ```bash
   # Đã có trong .gitignore
   Backend/.env
   ```

2. **Sử dụng password mạnh:**
   - Tối thiểu 12 ký tự
   - Kết hợp chữ hoa, thường, số, ký tự đặc biệt

3. **Giới hạn IP nếu production:**
   - Dev: `0.0.0.0/0` OK
   - Production: Chỉ whitelist server IP

4. **Tạo user riêng cho từng app:**
   - `financechain_dev` cho development
   - `financechain_prod` cho production

---

## 📊 Xem dữ liệu trên Atlas

1. Vào **"Database" → "Browse Collections"**
2. Chọn database `financechain`
3. Xem collections: `transactions`, `blocks`
4. Click vào document để xem chi tiết

---

## 🎓 Video Hướng dẫn MongoDB Atlas

- Setup: https://www.youtube.com/watch?v=rPqRyYJmx2g
- Connection: https://www.youtube.com/watch?v=084rmLU1UgA

---

## 🆘 Cần giúp?

1. Check logs Backend khi start: `uvicorn src.main:app --reload`
2. Xem connection status: `python scripts/test_connection.py`
3. MongoDB Atlas docs: https://docs.atlas.mongodb.com/
