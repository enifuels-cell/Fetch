@echo off
REM Fetch - Installation Script for Windows

echo =========================================
echo Fetch - Laravel Installation Script
echo =========================================

REM Check if PHP is installed
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PHP is not installed. Please install PHP 8.1+ first.
    pause
    exit /b 1
)

REM Check if Composer is installed
composer --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Composer is not installed. Please install Composer first.
    pause
    exit /b 1
)

echo PHP and Composer found
echo.

REM Copy environment file
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo .env file created
) else (
    echo .env file already exists
)

echo.
echo Installing dependencies...
composer install

echo Dependencies installed
echo.

echo Generating application key...
php artisan key:generate

echo Application key generated
echo.

echo Running database migrations...
php artisan migrate

echo Database migrations completed
echo.

echo Creating storage link...
php artisan storage:link

echo Storage link created
echo.

echo Setting file permissions...
REM For Windows, this is typically handled automatically

echo.
echo =========================================
echo Installation Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Update your .env file with database and Pusher credentials
echo 2. Run: php artisan serve
echo 3. In another terminal, run: php artisan queue:work database
echo 4. API will be available at: http://localhost:8000/api
echo.
echo For more information, see README.md and QUICK_START.md
echo.
pause
