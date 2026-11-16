@echo off
title SkillSwap Frontend
cd /d "%~dp0frontend"

echo ====================================================
echo Starting SkillSwap Frontend (Vite Dev Server)
echo ====================================================

call npm run dev
pause
