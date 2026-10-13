@echo off
setlocal enabledelayedexpansion

:: ==============================================================================
:: MediSlot (మెడిస్లాట్) - 1-Click All-in-One Startup Script (Windows)
:: Andhra Pradesh Government Hospital OPD Appointment & Queue Portal
:: ==============================================================================

cd /d "%~dp0"
title MediSlot OPD System

echo =====================================================================
echo               MediSlot (మెడిస్లాట్) OPD System
echo       Andhra Pradesh Government Healthcare Queue Portal
echo =====================================================================
echo.
echo Initializing environment and launching system...
echo.

:: Step 1: Check Node.js
echo [1/4] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this system.
    echo.
    echo Please install Node.js (version 18 or higher recommended):
    echo Download link: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js detected: %NODE_VER%

:: Step 2: Check npm
echo [OK] npm detected.

:: Step 3: Check & Install dependencies
echo.
echo [2/4] Checking project dependencies...
if not exist "node_modules\" (
    echo [INFO] Dependencies not found. Running npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check internet connection.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully!
) else (
    echo [OK] Dependencies already installed.
)

:: Step 4: Verify Database
echo.
echo [3/4] Checking SQLite database...
if exist "medislot.db" (
    echo [OK] Database file found: medislot.db
) else (
    echo [INFO] medislot.db will be automatically created and seeded on server launch.
)

:: Step 5: Port and launch
if "%PORT%"=="" set PORT=3000
echo.
echo [4/4] Starting server on port %PORT%...
echo Portal URL: http://localhost:%PORT%
echo.

:: Launch browser in background after 2 seconds
start /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:%PORT%"

echo Starting MediSlot Express Server...
echo Press Ctrl+C at any time to stop the server.
echo.

node server.js

if %errorlevel% neq 0 (
    echo.
    echo Server stopped with an error.
    pause
)
