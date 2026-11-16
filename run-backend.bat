@echo off
title SkillSwap Backend
cd /d "%~dp0backend"

echo ====================================================
echo Starting SkillSwap Backend (Spring Boot - Dev Mode)
echo ====================================================

:: Clean up stale lock files from previous abrupt terminations
if exist "data\skillswapdb.lock.db" (
    del /f /q "data\skillswapdb.lock.db" 2>nul
)

set "MAVEN_CMD=mvn"
where mvn >nul 2>nul
if %ERRORLEVEL% neq 0 (
    set "MAVEN_CMD=C:\Users\senth\.m2\wrapper\dists\apache-maven-3.9.6\0f95e7798d182e3371f3fee6d8202d3a56e6d71dfd3a2402139882ef2fbe7476\bin\mvn.cmd"
)

call "%MAVEN_CMD%" spring-boot:run -Dspring-boot.run.profiles=dev
pause
