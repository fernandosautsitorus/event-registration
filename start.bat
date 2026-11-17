@echo off
title Portal Registrasi & Scan Barcode Event Lomba
cls
echo ========================================================
echo   PORTAL REGISTRASI DAN CHECK-IN EVENT LOMBA (BARCODE)
echo ========================================================
echo Memulai server...
echo.

cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" server.js

pause
