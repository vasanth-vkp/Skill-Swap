@echo off
setlocal

where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    mvn %*
    goto :eof
)

set "MAVEN_FALLBACK=C:\Users\senth\.m2\wrapper\dists\apache-maven-3.9.6\0f95e7798d182e3371f3fee6d8202d3a56e6d71dfd3a2402139882ef2fbe7476\bin\mvn.cmd"
if exist "%MAVEN_FALLBACK%" (
    "%MAVEN_FALLBACK%" %*
    goto :eof
)

echo Error: Maven could not be found. Please ensure Maven is installed or added to PATH.
exit /b 1
