# Top Dog Arena - Application Startup Script
# PowerShell version for standard Angular multi-project workspace

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Top Dog Arena - Application Startup" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Angular applications..." -ForegroundColor Green
Write-Host ""

# Start both applications simultaneously (no dependencies)
Write-Host "Starting Player Landing Page on port 4201..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "ng serve playerLandingPage --port 4201" -WindowStyle Normal

Write-Host "Starting Shell Application on port 4200..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "ng serve shell --port 4200" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Applications started!" -ForegroundColor Green
Write-Host ""
Write-Host "Player Landing Page: http://localhost:4201" -ForegroundColor White
Write-Host "Shell Application:   http://localhost:4200" -ForegroundColor White
Write-Host ""
Write-Host "Both apps will build independently." -ForegroundColor Yellow
Write-Host "Check the terminal windows for build status." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

# Wait for user input
Read-Host
