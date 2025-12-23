# Run Frontend using Backend virtual environment and Waitress to avoid dev warnings
# Usage: powershell -ExecutionPolicy Bypass -File .\run_frontend.ps1

$ErrorActionPreference = "Stop"
$projRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projRoot "Backend"
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"

if (-Not (Test-Path $venvPython)) {
    Write-Host "Backend venv python not found at $venvPython" -ForegroundColor Yellow
    Write-Host "Create venv first: Set-Location $backendDir; python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Ensure waitress is installed in Backend venv
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install waitress

# Defaults for host/port
if (-Not $env:HOST) { $env:HOST = "127.0.0.1" }
if (-Not $env:PORT) { $env:PORT = "5001" }

# Run the Frontend Flask app via Waitress (module `app.py` with callable `app`)
Push-Location $PSScriptRoot
& $venvPython -m waitress --host $env:HOST --port $env:PORT app:app
Pop-Location
