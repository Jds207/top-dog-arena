@echo off
echo ========================================
echo    Top Dog Arena - Application Startup
echo ========================================
echo.
echo Starting Angular applications...
echo.

echo Starting Player Landing Page on port 4201...
start "Player Landing Page" cmd /k "ng serve playerLandingPage --port 4201"

echo Starting Shell Application on port 4200...
start "Shell Application" cmd /k "ng serve shell --port 4200"

echo.
echo ========================================
echo Applications started!
echo.
echo Player Landing Page: http://localhost:4201
echo Shell Application:   http://localhost:4200
echo.
echo Both apps will build independently.
echo Check the terminal windows for build status.
echo.
echo Press any key to continue...
echo ========================================
pause >nul
