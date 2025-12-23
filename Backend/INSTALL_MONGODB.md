# 🚀 Cài đặt MongoDB trên Windows - Quick Guide

## Cách 1: Cài MongoDB Community Server (Khuyên dùng)

### Bước 1: Tải về
1. Truy cập: https://www.mongodb.com/try/download/community
2. Chọn:
   - Version: 7.0.x (latest)
   - Platform: Windows
   - Package: MSI
3. Click **Download**

### Bước 2: Cài đặt
1. Chạy file `.msi` vừa tải
2. Chọn **Complete** installation
3. ✅ **Check** "Install MongoDB as a Service"
4. ✅ **Check** "Run service as Network Service user"
5. Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
6. Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
7. Click **Next** → **Install**

### Bước 3: Kiểm tra MongoDB đang chạy
```powershell
# Kiểm tra service
Get-Service MongoDB

# Hoặc mở Task Manager → Services → tìm "MongoDB"
```

### Bước 4: Cài MongoDB Shell (mongosh)
```powershell
winget install MongoDB.Shell
```

### Bước 5: Test kết nối
```powershell
# Trong thư mục Backend
cd D:\Frojeck Viungdungtaichinhcanhan\Frojeck-Viungdungtaichinhcanhan\Backend
.\.venv\Scripts\Activate.ps1
python scripts/test_connection.py
```

---

## Cách 2: Dùng Docker (Nhanh nhất)

### Yêu cầu: Docker Desktop đã cài

```powershell
# Pull image và chạy container
docker run -d `
  --name mongodb `
  -p 27017:27017 `
  -v mongodb_data:/data/db `
  mongo:latest

# Kiểm tra container
docker ps

# Xem logs
docker logs mongodb

# Test connection
cd Backend
.\.venv\Scripts\Activate.ps1
python scripts/test_connection.py
```

### Quản lý Docker MongoDB:
```powershell
# Stop
docker stop mongodb

# Start
docker start mongodb

# Remove
docker rm -f mongodb

# Remove data
docker volume rm mongodb_data
```

---

## Cách 3: MongoDB Atlas (Cloud - Free tier)

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Tạo account miễn phí
3. Tạo cluster (chọn FREE tier)
4. Whitelist IP: `0.0.0.0/0` (cho phép tất cả)
5. Tạo database user
6. Copy connection string

### Cập nhật `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=financechain
```

---

## Sau khi cài MongoDB

### 1. Test connection
```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
python scripts/test_connection.py
```

### 2. Tạo dữ liệu mẫu
```powershell
python scripts/create_sample_data.py
```

### 3. Khởi động Backend
```powershell
uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload
```

### 4. Khởi động Frontend
```powershell
cd ../Frontend
npm run dev
```

---

## Troubleshooting

### MongoDB service không start được
```powershell
# Xem log
Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 50

# Thử start manual
net start MongoDB
```

### Port 27017 bị chiếm
```powershell
# Kiểm tra port
netstat -ano | findstr :27017

# Kill process (thay <PID>)
taskkill /PID <PID> /F
```

### Lỗi authentication
```powershell
# MongoDB local mặc định không cần auth
# Nếu cần, update .env:
MONGO_URI=mongodb://username:password@localhost:27017
```

---

## So sánh các phương pháp

| Phương pháp | Ưu điểm | Nhược điểm |
|------------|---------|------------|
| **MongoDB Server** | ✅ Performance tốt<br>✅ Full control<br>✅ Offline | ❌ Cài đặt phức tạp<br>❌ Chiếm dung lượng |
| **Docker** | ✅ Cài đặt nhanh<br>✅ Dễ xóa/reset<br>✅ Isolated | ❌ Cần Docker Desktop<br>❌ Overhead |
| **Atlas Cloud** | ✅ Không cần cài<br>✅ Free tier<br>✅ Backup tự động | ❌ Cần internet<br>❌ Giới hạn 512MB |

---

## Khuyến nghị

- **Development:** Docker hoặc MongoDB Server
- **Production:** MongoDB Atlas
- **Quick test:** Docker

---

## ✅ Checklist

- [ ] MongoDB installed/running
- [ ] Port 27017 available
- [ ] `test_connection.py` success
- [ ] Sample data created
- [ ] Backend started
- [ ] Frontend connected
