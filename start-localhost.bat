@echo off
title Portal Registrasi Event Lomba - Server Localhost
color 0B
cls

echo =======================================================================
echo     SISTEM REGISTRASI & CHECK-IN EVENT LOMBA (LOCALHOST RESMI)
echo =======================================================================
echo.
echo  [1/3] Memeriksa instalasi Node.js...
cd /d "%~dp0"

set "NODE_CMD=node"
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    ) else (
        echo [ERROR] Node.js tidak ditemukan! Silakan install Node.js terlebih dahulu.
        pause
        exit /b 1
    )
)

echo  [2/3] Memeriksa modul dependensi...
if not exist "node_modules\" (
    echo Menginstal dependensi awal...
    call "%NODE_CMD%" -v
    call npm install
)

echo  [3/3] Menjalankan Server Localhost...
echo.
echo =======================================================================
echo   SERVER BERHASIL DIAKTIFKAN! Buka tautan berikut di Browser Anda:
echo =======================================================================
echo.
echo  - Dashboard Laptop Admin : http://localhost:3000/admin.html
echo  - Scanner Meja Registrasi: http://localhost:3000/scanner.html
echo  - Formulir Pendaftaran   : http://localhost:3000/register.html
echo  - Menu Utama Portal      : http://localhost:3000/
echo.
echo -----------------------------------------------------------------------
echo  UNTUK HP / LAPTOP LAIN DALAM 1 WI-FI (Gunakan IP berikut di HP):
echo  - Scanner Kamera HP      : http://192.168.1.4:3000/scanner.html
echo -----------------------------------------------------------------------
echo.
echo (JANGAN TUTUP JENDELA INI SELAMA EVENT BERLANGSUNG)
echo Tekan Ctrl + C untuk mematikan server.
echo =======================================================================
echo.

"%NODE_CMD%" server.js

pause
