@echo off
setlocal EnableDelayedExpansion

set PROJECT_ROOT=c:\Users\jds86\OneDrive\Documents\Top Dog Arena\Projects\td-player-ui

echo ================================================
echo  Top Dog Arena - Module Federation Startup
echo ================================================
echo Project Directory: %PROJECT_ROOT%
echo.

REM Clean any existing node processes
echo Cleaning existing Node processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo Starting services in correct order...
echo.

REM Step 1: Start NFT Marketplace (Remote)
echo [1/3] Starting NFT Marketplace Remote on port 4202...
start "NFT Marketplace" cmd /c "title NFT Marketplace Service && cd /d \"%PROJECT_ROOT%\" && npm run start:nft-marketplace"

echo Waiting for NFT Marketplace to initialize...
:wait_nft
timeout /t 3 /nobreak >nul
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4202/remoteEntry.js' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo   Still waiting for NFT Marketplace...
    goto wait_nft
)
echo   ✅ NFT Marketplace is ready!

echo.

REM Step 2: Start Player Landing Page (Remote)
echo [2/3] Starting Player Landing Page Remote on port 4201...
start "Player Landing" cmd /c "title Player Landing Service && cd /d \"%PROJECT_ROOT%\" && npm run start:player-landing"

echo Waiting for Player Landing Page to initialize...
:wait_player
timeout /t 3 /nobreak >nul
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4201/remoteEntry.js' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo   Still waiting for Player Landing Page...
    goto wait_player
)
echo   ✅ Player Landing Page is ready!

echo.

REM Step 3: Start Shell (Host)
echo [3/3] Starting Shell Host on port 4200...
echo All remotes are ready, starting shell application...
start "Shell Host" cmd /c "title Shell Host Service && cd /d \"%PROJECT_ROOT%\" && npm run start:shell"

echo Waiting for Shell to initialize...
:wait_shell
timeout /t 3 /nobreak >nul
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4200' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% neq 0 (
    echo   Still waiting for Shell...
    goto wait_shell
)
echo   ✅ Shell Host is ready!

echo.
echo ================================================
echo  🎉 All services are now running!
echo ================================================
echo.
echo Service URLs:
echo   🏪 NFT Marketplace:    http://localhost:4202
echo   🎮 Player Landing:     http://localhost:4201  
echo   🏠 Shell Host:         http://localhost:4200
echo.
echo Integration URLs:
echo   🔗 NFT Marketplace:    http://localhost:4200/nftMarketplace
echo   🔗 Player Landing:     http://localhost:4200/player-landing-page
echo.
echo ================================================
echo All services will continue running in separate windows.
echo Close those windows to stop the services.
echo.
pause
