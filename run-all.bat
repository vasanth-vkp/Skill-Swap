@echo off
title SkillSwap Launcher
cd /d "%~dp0"

echo ====================================================
echo Starting SkillSwap Fullstack Application
echo ====================================================

echo [1/2] Launching Backend in a new window...
start "SkillSwap Backend" cmd /k "%~dp0run-backend.bat"

echo [2/2] Launching Frontend in a new window...
start "SkillSwap Frontend" cmd /k "%~dp0run-frontend.bat"

echo.
echo Both services are starting up!
echo - Backend API:  http://localhost:8080
echo - Frontend UI:  http://localhost:5173
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo Done. You can close this window.
