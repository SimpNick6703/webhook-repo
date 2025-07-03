@echo off
REM GitHub Webhook Logger - Windows Startup Script
REM This script helps you get the application running quickly on Windows

echo  GitHub Webhook Logger - Startup Script
echo ==========================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed  
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist "backend\.env" (
    echo  Creating environment file...
    copy "backend\.env.example" "backend\.env"
    echo  Environment file created at backend\.env
    echo  Please edit backend\.env with your webhook secret!
)

REM Build and start the application
echo  Building Docker containers...
docker-compose build

echo  Starting services...
docker-compose up -d

REM Wait for services to be ready
echo  Waiting for services to start...
timeout /t 10 /nobreak >nul

echo  Checking service health...

REM Check if services are responding
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5000/health' -UseBasicParsing | Out-Null; Write-Host ' Backend is running at http://localhost:5000' } catch { Write-Host '❌ Backend is not responding' }"

powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing | Out-Null; Write-Host ' Frontend is running at http://localhost:3000' } catch { Write-Host '❌ Frontend is not responding' }"

echo.
echo  Application startup complete!
echo.
echo  Access Points:
echo    Web Interface: http://localhost:3000
echo    API Endpoint:  http://localhost:5000
echo    Health Check:  http://localhost:5000/health
echo.
echo  Next Steps:
echo    1. Edit backend\.env with your GitHub webhook secret
echo    2. Configure GitHub webhook to point to your endpoint
echo    3. Test by pushing to your repository
echo.
echo  Commands:
echo    View logs:     docker-compose logs -f
echo    Stop services: docker-compose down
echo    Run tests:     cd tests ^&^& python run_tests.py
echo.
pause
