@echo off
title Bagikan Link Online (Plan B Internet Publik)
cls
echo ========================================================
echo   PORTAL REGISTRASI EVENT - BAGIKAN LINK ONLINE (PLAN B)
echo ========================================================
echo.
echo Menghubungkan ke Cloudflare Tunnel (Tanpa Password, Langsung Terbuka)...
echo Tunggu beberapa detik hingga muncul link "...trycloudflare.com" di bawah:
echo ========================================================
echo.

cd /d "%~dp0"
if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" (
    "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000
) else if exist "C:\Program Files\cloudflared\cloudflared.exe" (
    "C:\Program Files\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000
) else (
    set "PATH=C:\Program Files\nodejs;%PATH%"
    call "C:\Program Files\nodejs\npx.cmd" localtunnel --port 3000
)

pause
