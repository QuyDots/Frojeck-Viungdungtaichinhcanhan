<#
Script này trước đây dùng để chạy cả Backend Flask + Frontend Flask
và Caddy reverse proxy. Stack hiện tại đã đổi sang:

- Backend: FastAPI (uvicorn) ở thư mục Backend
- Frontend: Vite + Node.js ở thư mục Frontend

Để chạy dự án bây giờ, dùng các lệnh sau trong PowerShell:

  # Backend
  cd Backend
  python -m venv .venv          # nếu chưa có
  .\.venv\Scripts\python.exe -m pip install -r requirements.txt
  .\.venv\Scripts\python.exe -m uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload

  # Frontend
  cd ..\Frontend
  npm install                    # lần đầu
  npm run dev                    # UI tại http://127.0.0.1:5173

Script run_all.ps1 được giữ lại chỉ để tham chiếu lịch sử,
không còn được dùng trong flow chính.
#>

Write-Host "run_all.ps1: stack mới đã chuyển sang FastAPI + Vite." -ForegroundColor Yellow
Write-Host "Xem README_RUN.md để biết cách chạy chi tiết." -ForegroundColor Yellow
