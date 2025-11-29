@echo off
echo ========================================
echo  CRON-X AI SOC System - Starting...
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/3] Installing Python dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Starting MCP AI Server on port 8001...
start "MCP AI Server" cmd /k "python mcp_server.py"
timeout /t 3 >nul

echo.
echo [3/3] Starting Main API Server on port 8000...
start "Main API Server" cmd /k "python -m uvicorn main:app --reload --port 8000"
timeout /t 3 >nul

echo.
echo ========================================
echo  Backend Servers Started!
echo ========================================
echo  MCP AI Server:  http://localhost:8001
echo  Main API:       http://localhost:8000
echo  API Docs:       http://localhost:8000/docs
echo ========================================
echo.
echo Now start the frontend with: cd frontend ^&^& npm run dev
echo.
pause
