param(
    [switch]$Seed
)

# Run backend using the venv python; also optionally seed demo data
# This disables the venv prompt so you won't see the '(.venv)' prefix.

# Disable virtualenv changing the prompt for this process
$env:VIRTUAL_ENV_DISABLE_PROMPT = "1"

# Path to venv python
$venvPath = Join-Path $PSScriptRoot ".venv"
$venvPython = Join-Path $venvPath "Scripts\python.exe"
if (-Not (Test-Path $venvPython)) {
    Write-Host "venv python not found; creating venv at $(Join-Path $PSScriptRoot '.venv')" -ForegroundColor Cyan
    python -m venv (Join-Path $PSScriptRoot ".venv")
}

# Ensure requirements exist and include waitress
$requirements = Join-Path $PSScriptRoot "requirements.txt"
if (-Not (Test-Path $requirements)) {
    @(
        "flask",
        "flask-cors",
        "uvicorn"
    ) | Set-Content -Path $requirements -Encoding UTF8
}

# Install/upgrade requirements
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r $requirements

# Optional: set HOST and PORT (defaults 127.0.0.1:8000)
if (-Not $env:HOST) { $env:HOST = "127.0.0.1" }
if (-Not $env:PORT) { $env:PORT = "5000" }

# Optionally activate venv for current process (for user visibility)
try { . (Join-Path $PSScriptRoot ".venv\Scripts\Activate.ps1"); Write-Host "Đã kích hoạt môi trường ảo (.venv)" -ForegroundColor Cyan } catch {}

# Enable seeding via environment variable so app seeds on startup
if ($Seed) { $env:SEED_SAMPLE = "1"; Write-Host "Bật seed dữ liệu mẫu (SEED_SAMPLE=1)" -ForegroundColor Cyan }

# Start using Waitress to avoid Flask development server warnings
# Serve the WSGI app callable defined in app.py as `app`
Write-Host "Starting backend (FastAPI) on http://127.0.0.1:5000" -ForegroundColor Cyan
& $venvPython -m uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload
Start-Sleep -Seconds 1
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$env:PORT/api/health" -Method Get -ErrorAction Stop
    Write-Host "Health: $($resp.status)" -ForegroundColor Green
} catch {
    Write-Host "Không thể kiểm tra /api/health ngay sau khi khởi động." -ForegroundColor Yellow
}
