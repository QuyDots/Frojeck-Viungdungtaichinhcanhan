# Hướng dẫn chạy dự án (FastAPI + Vite)

Stack hiện tại:
- Backend: FastAPI + MongoDB, chạy bằng uvicorn tại http://127.0.0.1:5000
- Frontend: Vite + Vanilla JS tại http://127.0.0.1:5173
- Onchain: Hardhat + PersonalFinance.sol (tùy chọn)

## 1) Yêu cầu
- Python 3.10+ (Windows)
- Node.js 18+ và npm
- PowerShell

## 2) Backend (FastAPI)

```powershell
cd Backend

# Tạo venv (chỉ lần đầu)
python -m venv .venv

# Cài dependency
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# Chạy API (http://127.0.0.1:5000)
.\.venv\Scripts\python.exe -m uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload
```

Kiểm tra nhanh:
- Health: http://127.0.0.1:5000/api/health
- Transactions: http://127.0.0.1:5000/api/transactions

## 3) Frontend (Vite UI)

```powershell
cd Frontend

# Cài dependency JS (chỉ lần đầu)
npm install

# Chạy dev server (http://127.0.0.1:5173)
npm run dev
```

Trong trình duyệt mở http://127.0.0.1:5173, kết nối MetaMask và sử dụng các tab Dashboard / Giao dịch / Blockchain / Thêm mới.

## 4) Onchain (Hardhat, tùy chọn)

```powershell
cd onchain
npm install          # lần đầu

# Deploy PersonalFinance lên Sepolia
npx hardhat run --network sepolia scripts/deploy_pf.js
```

Lấy địa chỉ contract in ra và cấu hình cho frontend:

- Thêm vào file `Frontend/.env`:

	```env
	VITE_PERSONAL_FINANCE_CONTRACT=0x...dia_chi_contract...
	```

- Khởi động lại `npm run dev` để Vite nhận env mới.

## 5) Gỡ rối nhanh
- Nếu backend báo lỗi kết nối Mongo: kiểm tra MongoDB đang chạy trên `mongodb://localhost:27017` hoặc chỉnh `MONGO_URI` trong `Backend/.env`.
- Nếu UI báo Offline: mở DevTools Console để xem lỗi fetch tới `/api/transactions`.
- Nếu MetaMask không hiện popup: kiểm tra đã kết nối ví và chọn đúng mạng Sepolia.
