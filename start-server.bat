@echo off
REM Pachtaki Yadu - Network Server Startup Script (Windows)
REM This script starts the server and displays network access information

cls
echo.
echo ════════════════════════════════════════════════════════════
echo     PACHTAKI YADU - DIGITAL VILLAGE PORTAL STARTUP
echo     Network Configuration Enabled
echo ════════════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed!
    echo Install from: https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| find "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)

:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo Network Access Information:
echo ════════════════════════════════════════════════════════════
echo.
echo Local Access:     http://localhost:3000
echo Network Access:   http://%LOCAL_IP%:3000
echo.
echo Starting server...
echo.

REM Start the server
node server.js

pause
