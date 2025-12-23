# 🚀 Quick Start - MongoDB Atlas

## Bước 1: Lấy Connection String (2 phút)

Từ ảnh MongoDB Atlas bạn gửi, làm theo:

1. **Click "DATABASE"** (menu trái) → **"Clusters"**
2. **Click "Connect"** (nút trên cluster)
3. **Chọn "Connect your application"**
4. **Copy connection string** (dạng `mongodb+srv://...`)

## Bước 2: Tạo Database User (1 phút)

1. **Click "SECURITY"** → **"Database Access"**
2. **"Add New Database User"**
   - Username: `financechain_user`
   - Password: [Tạo và LƯU LẠI]
   - Role: **Read and write to any database**
3. **"Add User"**

## Bước 3: Whitelist IP (1 phút)

1. **"SECURITY"** → **"Network Access"**
2. **"Add IP Address"**
3. **"Allow Access from Anywhere"** → `0.0.0.0/0`
4. **"Confirm"**

## Bước 4: Cập nhật .env

Mở `Backend/.env` và paste:

```env
MONGO_URI=mongodb+srv://financechain_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=financechain
```

**Thay:** `YOUR_PASSWORD` bằng password bạn tạo ở bước 2

## Bước 5: Test & Run (1 phút)

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1

# Test connection
python scripts/test_connection.py

# Tạo dữ liệu mẫu (20 transactions)
python scripts/create_sample_data.py

# Start Backend
uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload
```

## Bước 6: Start Frontend

Terminal mới:

```powershell
cd Frontend
npm run dev
```

Mở: **http://127.0.0.1:5173**

---

## ✅ Checklist

- [ ] Connection string đã copy
- [ ] Database user đã tạo (lưu password)
- [ ] Network access: `0.0.0.0/0`
- [ ] File `.env` đã update
- [ ] `test_connection.py` → ✅ success
- [ ] `create_sample_data.py` → 20 transactions created
- [ ] Backend running → port 5000
- [ ] Frontend running → port 5173

---

## 🎯 Kết quả

- **API**: http://127.0.0.1:5000/api/transactions
- **UI**: http://127.0.0.1:5173
- **Atlas Dashboard**: https://cloud.mongodb.com → Browse Collections

---

## ❌ Lỗi thường gặp

### "Authentication failed"
→ Sai password trong `.env`, check lại

### "IP not whitelisted"  
→ Vào Network Access, add `0.0.0.0/0`

### "Connection timeout"
→ Đợi 1-2 phút sau khi add IP

---

**Tổng thời gian: ~5 phút** ⏱️
