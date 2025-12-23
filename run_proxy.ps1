<#
Trước đây script này dùng để tải và chạy Caddy reverse proxy,
gom cả UI và API về chung http://127.0.0.1:5000.

Hiện tại workflow đã đơn giản hơn:
- Backend FastAPI tự chạy trên http://127.0.0.1:5000
- Frontend Vite dev server chạy trên http://127.0.0.1:5173

Không cần Caddy nữa nên script này chỉ giữ lại như tài liệu tham khảo.
#>

Write-Host "run_proxy.ps1: không còn được dùng, bỏ qua." -ForegroundColor Yellow
