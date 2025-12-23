run Backend 
cd Backend
.\.venv\Scripts\Activate.ps1
.\.venv\Scripts\python.exe -m uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload

run fontend
cd Frontend
npm install        # lần đầu
npm run dev        