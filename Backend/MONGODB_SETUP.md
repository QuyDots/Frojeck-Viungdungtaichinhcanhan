# FinanceChain - MongoDB Setup

## Bước 1: Cài đặt MongoDB

### Windows:
1. Tải MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Cài đặt với default settings
3. MongoDB sẽ chạy tự động trên `mongodb://localhost:27017`
4. Kiểm tra MongoDB đang chạy: mở Task Manager → Services → tìm "MongoDB"

### Hoặc dùng Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Kiểm tra kết nối:
```bash
# Cài MongoDB Shell (mongosh)
# Windows: winget install MongoDB.Shell
mongosh
```

## Bước 2: Cấu hình

File `.env` trong thư mục Backend (đã tạo sẵn):
```
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=financechain
```

## Bước 3: Cài đặt dependencies

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Bước 4: Tạo dữ liệu mẫu

### Cách 1: Dùng script Python (Khuyên dùng)
```powershell
# Tạo 20 giao dịch mẫu và blocks
python scripts/create_sample_data.py

# Xem dữ liệu
python scripts/view_data.py

# Xóa toàn bộ (nếu cần)
python scripts/clear_data.py
```

### Cách 2: Dùng MongoDB Shell
```javascript
// Mở mongosh
mongosh

// Chọn database
use financechain

// Tạo transactions
db.transactions.insertMany([
  {
    sender: "Alice",
    recipient: "Bob",
    amount: 100,
    mined: true,
    created_at: new Date()
  },
  {
    sender: "Carol",
    recipient: "Dave",
    amount: 50,
    mined: true,
    created_at: new Date()
  }
])

// Tạo block
db.blocks.insertOne({
  index: 0,
  timestamp: Date.now() / 1000,
  transactions: [
    {sender: "Alice", recipient: "Bob", amount: 100},
    {sender: "Carol", recipient: "Dave", amount: 50}
  ],
  created_at: new Date()
})
```

### Cách 3: Dùng API (qua Frontend hoặc Postman)
```bash
# POST giao dịch mới
curl -X POST http://127.0.0.1:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"sender":"Alice","recipient":"Bob","amount":100}'
```

## Bước 5: Chạy Backend

```powershell
cd Backend
uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload
```

Backend sẽ:
- ✅ Tự động kết nối MongoDB
- ✅ Tạo collections (transactions, blocks) nếu chưa có
- ✅ Load seed data từ `seed.json` nếu DB trống

## Bước 6: Xem dữ liệu

### Trong MongoDB Shell:
```javascript
mongosh

use financechain

// Xem tất cả transactions
db.transactions.find().pretty()

// Xem blocks
db.blocks.find().pretty()

// Đếm số lượng
db.transactions.countDocuments()
db.blocks.countDocuments()

// Tìm giao dịch theo người gửi
db.transactions.find({sender: "Alice"})

// Top người gửi nhiều nhất
db.transactions.aggregate([
  {$group: {_id: "$sender", total: {$sum: "$amount"}}},
  {$sort: {total: -1}}
])
```

### Qua API:
- Xem transactions: http://127.0.0.1:5000/api/transactions
- Health check: http://127.0.0.1:5000/api/health

### Qua Frontend:
- Mở: http://127.0.0.1:5173
- Các tab: Dashboard, Giao dịch, Blockchain

## Scripts có sẵn

| Script | Chức năng |
|--------|-----------|
| `scripts/create_sample_data.py` | Tạo 20 giao dịch + blocks mẫu |
| `scripts/view_data.py` | Xem dữ liệu + thống kê |
| `scripts/clear_data.py` | Xóa toàn bộ dữ liệu |

## Troubleshooting

### Lỗi: "No module named 'pymongo'"
```powershell
pip install pymongo motor
```

### Lỗi: "Connection refused"
- Kiểm tra MongoDB đang chạy: Task Manager → Services → MongoDB
- Hoặc khởi động: `net start MongoDB`

### Lỗi: "Database already has X blocks, skipping seed"
- Đây là hành vi bình thường (không seed lại nếu có data)
- Muốn reset: chạy `python scripts/clear_data.py`

## Tính năng

- ✅ Lưu trữ persistent (không mất data khi restart)
- ✅ Transaction history đầy đủ
- ✅ Query nhanh với MongoDB indexing
- ✅ Async operations (FastAPI + Motor)
- ✅ Auto-seed khi DB trống
- ✅ Hỗ trợ cả sync và async operations
