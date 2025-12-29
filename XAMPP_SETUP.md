# Fetch - XAMPP Setup Guide

## Complete Guide for Setting Up Fetch with XAMPP on Windows

This guide will walk you through setting up the Fetch motorcycle ride booking system using XAMPP for local testing and development.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install XAMPP](#install-xampp)
3. [Setup Laravel Project](#setup-laravel-project)
4. [Configure Database](#configure-database)
5. [Configure Apache for Laravel](#configure-apache-for-laravel)
6. [Install Dependencies](#install-dependencies)
7. [Run Migrations](#run-migrations)
8. [Start the Application](#start-the-application)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Windows 7/8/10/11** (64-bit recommended)
- **Administrator access** on your computer
- **At least 2GB free disk space**
- **Internet connection** for downloading dependencies

---

## 1. Install XAMPP

### Step 1.1: Download XAMPP

1. Visit the official XAMPP website: https://www.apachefriends.org/
2. Download **XAMPP for Windows** (PHP 8.1 or higher)
3. Choose the latest stable version

### Step 1.2: Install XAMPP

1. Run the downloaded installer `xampp-windows-x64-8.x.x-x-VS16-installer.exe`
2. If Windows Defender or antivirus warns you, click "Yes" or "Allow"
3. Choose components to install (ensure these are checked):
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin
4. Choose installation directory: `C:\xampp` (recommended default)
5. Click "Next" through the installation wizard
6. Uncheck "Learn more about Bitnami" (optional)
7. Click "Finish" once installation completes

### Step 1.3: Start XAMPP Control Panel

1. Open **XAMPP Control Panel** from Start Menu or `C:\xampp\xampp-control.exe`
2. Click "Start" for **Apache**
3. Click "Start" for **MySQL**
4. Both should show green "Running" status

**Important:** If ports 80 or 443 are already in use:
- Stop other services using these ports (Skype, IIS, etc.)
- Or configure Apache to use different ports (see Troubleshooting section)

---

## 2. Setup Laravel Project

### Step 2.1: Install Composer

Composer is required for Laravel dependency management.

1. Download Composer from: https://getcomposer.org/Composer-Setup.exe
2. Run the installer
3. When prompted for PHP path, select: `C:\xampp\php\php.exe`
4. Complete the installation
5. Open Command Prompt and verify:
   ```cmd
   composer --version
   ```
   You should see: `Composer version 2.x.x`

### Step 2.2: Copy Project to htdocs

1. Copy/Clone the Fetch project to XAMPP's htdocs directory:
   ```
   C:\xampp\htdocs\fetch\
   ```

2. Your project structure should look like:
   ```
   C:\xampp\htdocs\fetch\
   ├── app/
   ├── bootstrap/
   ├── config/
   ├── database/
   ├── public/
   ├── resources/
   ├── routes/
   ├── storage/
   ├── .env.example
   ├── artisan
   ├── composer.json
   └── ...
   ```

---

## 3. Configure Database

### Step 3.1: Create Database via phpMyAdmin

1. Open your web browser
2. Navigate to: http://localhost/phpmyadmin
3. Click on "Databases" tab
4. In "Create database" section:
   - Database name: `fetch`
   - Collation: `utf8mb4_unicode_ci`
5. Click "Create"

### Step 3.2: Configure Environment File

1. Navigate to: `C:\xampp\htdocs\fetch\`
2. Copy `.env.example` to `.env`:
   ```cmd
   copy .env.example .env
   ```
3. Open `.env` in a text editor (Notepad++ recommended)
4. Update database configuration:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=fetch
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   **Note:** XAMPP MySQL default password is empty

5. Set APP_URL:
   ```env
   APP_URL=http://localhost/fetch/public
   ```

6. Configure Pusher (get free account at https://pusher.com):
   ```env
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   ```

---

## 4. Configure Apache for Laravel

### Method 1: Access via /fetch/public (Quick Setup)

This is the easiest method - no Apache configuration needed.

Simply access your application at:
```
http://localhost/fetch/public
```

API endpoints will be at:
```
http://localhost/fetch/public/api
```

### Method 2: Create Virtual Host (Recommended for Production-like Setup)

This allows you to access the app via a custom domain like `http://fetch.test`

#### Step 4.1: Enable Virtual Hosts in Apache

1. Open `C:\xampp\apache\conf\httpd.conf`
2. Find this line (around line 500):
   ```
   #Include conf/extra/httpd-vhosts.conf
   ```
3. Remove the `#` to uncomment:
   ```
   Include conf/extra/httpd-vhosts.conf
   ```
4. Save and close

#### Step 4.2: Configure Virtual Host

1. Open `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
2. Add this configuration at the end:
   ```apache
   <VirtualHost *:80>
       DocumentRoot "C:/xampp/htdocs/fetch/public"
       ServerName fetch.test
       ServerAlias www.fetch.test
       
       <Directory "C:/xampp/htdocs/fetch/public">
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       ErrorLog "logs/fetch-error.log"
       CustomLog "logs/fetch-access.log" common
   </VirtualHost>
   ```
3. Save and close

#### Step 4.3: Update Windows Hosts File

1. Open Notepad **as Administrator**
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add this line at the end:
   ```
   127.0.0.1 fetch.test
   ```
4. Save and close

#### Step 4.4: Restart Apache

1. Go to XAMPP Control Panel
2. Click "Stop" on Apache
3. Click "Start" on Apache
4. Access your app at: http://fetch.test

---

## 5. Install Dependencies

### Step 5.1: Install PHP Dependencies

1. Open **Command Prompt as Administrator**
2. Navigate to project directory:
   ```cmd
   cd C:\xampp\htdocs\fetch
   ```
3. Install Composer dependencies:
   ```cmd
   composer install
   ```
   This may take 5-10 minutes depending on your internet speed.

### Step 5.2: Generate Application Key

```cmd
php artisan key:generate
```

You should see: `Application key set successfully.`

### Step 5.3: Set File Permissions

```cmd
php artisan storage:link
```

If you encounter permission errors, manually set folder permissions:
1. Right-click `storage` folder → Properties → Security
2. Edit permissions for "Users" → Allow "Full control"
3. Repeat for `bootstrap/cache` folder

---

## 6. Run Migrations

### Step 6.1: Run Database Migrations

```cmd
php artisan migrate
```

You should see output like:
```
Migration table created successfully.
Migrating: 2024_01_01_000000_create_users_table
Migrated:  2024_01_01_000000_create_users_table
...
```

### Step 6.2: (Optional) Seed Test Data

```cmd
php artisan db:seed
```

---

## 7. Start the Application

### Option 1: Using XAMPP (Recommended for beginners)

1. Ensure Apache and MySQL are running in XAMPP Control Panel
2. Open browser and navigate to:
   - Using Method 1: http://localhost/fetch/public
   - Using Method 2 (Virtual Host): http://fetch.test

### Option 2: Using PHP Built-in Server (Alternative)

1. Open **two** Command Prompt windows

**Terminal 1 - Laravel Server:**
```cmd
cd C:\xampp\htdocs\fetch
php artisan serve
```

**Terminal 2 - Queue Worker (for notifications):**
```cmd
cd C:\xampp\htdocs\fetch
php artisan queue:work database
```

Access at: http://localhost:8000

---

## 8. Testing the Installation

### Test 1: Check Home Page

Navigate to your configured URL. You should see:
- **Fetch** welcome page with system status
- Green "✓ System Online" indicator

### Test 2: Test API Health Check

Visit: `http://your-url/api/health`

Expected response:
```json
{
    "status": "ok",
    "timestamp": "2024-12-29T12:00:00Z"
}
```

### Test 3: Register Test User

Using a tool like **Postman** or **cURL**:

```bash
# In Command Prompt or PowerShell
curl -X POST http://localhost/fetch/public/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\",\"phone_number\":\"1234567890\",\"role\":\"passenger\"}"
```

You should receive a token in the response.

---

## 9. Troubleshooting

### Issue: Apache Won't Start - Port 80 in Use

**Solution 1:** Stop conflicting services
- Close Skype, other web servers
- Stop IIS: Open Services → Stop "World Wide Web Publishing Service"

**Solution 2:** Change Apache port
1. Open `C:\xampp\apache\conf\httpd.conf`
2. Find: `Listen 80`
3. Change to: `Listen 8080`
4. Find: `ServerName localhost:80`
5. Change to: `ServerName localhost:8080`
6. Save and restart Apache
7. Access via: http://localhost:8080/fetch/public

### Issue: MySQL Won't Start - Port 3306 in Use

**Solution:** Change MySQL port
1. Open `C:\xampp\mysql\bin\my.ini`
2. Find: `port=3306`
3. Change to: `port=3307`
4. Update `.env`: `DB_PORT=3307`
5. Restart MySQL

### Issue: "Access denied for user 'root'@'localhost'"

**Solution:**
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click "User accounts"
3. Find root@localhost
4. Click "Edit privileges"
5. Change password or set to blank
6. Update `.env` file with correct password

### Issue: "Class 'X' not found" or Composer Errors

**Solution:**
```cmd
composer dump-autoload
php artisan clear-compiled
php artisan cache:clear
php artisan config:clear
```

### Issue: "The stream or file could not be opened"

**Solution:** Set storage permissions
```cmd
# Run as Administrator
icacls "C:\xampp\htdocs\fetch\storage" /grant Users:(OI)(CI)F /T
icacls "C:\xampp\htdocs\fetch\bootstrap\cache" /grant Users:(OI)(CI)F /T
```

### Issue: .htaccess Not Working

**Solution:** Enable mod_rewrite in Apache
1. Open `C:\xampp\apache\conf\httpd.conf`
2. Find: `#LoadModule rewrite_module modules/mod_rewrite.so`
3. Remove `#` to uncomment
4. Restart Apache

### Issue: Pusher Notifications Not Working

**Solution:**
1. Verify Pusher credentials in `.env`
2. Start queue worker: `php artisan queue:work database`
3. Check Laravel logs: `storage/logs/laravel.log`

---

## Useful Commands

```cmd
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# View all routes
php artisan route:list

# Reset database
php artisan migrate:fresh

# Run database migrations
php artisan migrate

# Check Laravel version
php artisan --version

# Open Laravel Tinker (interactive shell)
php artisan tinker

# View logs in real-time
tail -f storage/logs/laravel.log
```

---

## Recommended Tools for Development

1. **Text Editor/IDE:**
   - Visual Studio Code (Free): https://code.visualstudio.com/
   - PHPStorm (Paid): https://www.jetbrains.com/phpstorm/

2. **API Testing:**
   - Postman (Free): https://www.postman.com/
   - Insomnia (Free): https://insomnia.rest/

3. **Database Management:**
   - phpMyAdmin (Included with XAMPP)
   - HeidiSQL (Free): https://www.heidisql.com/
   - MySQL Workbench (Free): https://www.mysql.com/products/workbench/

4. **Git Version Control:**
   - Git for Windows: https://git-scm.com/download/win
   - GitHub Desktop: https://desktop.github.com/

---

## Next Steps

After successful XAMPP setup:

1. ✅ Test all API endpoints using Postman
2. 📚 Read `API_DOCUMENTATION.md` for complete API reference
3. 🚀 Review `QUICK_START.md` for usage examples
4. 💻 Start building your frontend application
5. 📱 Consider mobile app development (React Native/Flutter)

---

## Production Deployment

XAMPP is **NOT recommended for production**. For production deployment:

- Use proper web servers (Nginx, Apache on Linux)
- Refer to `DEPLOYMENT.md` for production setup
- Use cloud hosting (AWS, DigitalOcean, Heroku)
- Enable HTTPS/SSL certificates
- Configure proper backups and monitoring

---

## Support

If you encounter issues:

1. Check `storage/logs/laravel.log` for error details
2. Review this troubleshooting section
3. Check Laravel documentation: https://laravel.com/docs
4. Google specific error messages
5. Ask on Laravel community forums: https://laracasts.com/discuss

---

## Important Security Notes

⚠️ **For Development Only:**
- XAMPP default MySQL has no root password
- Debug mode is enabled
- All origins allowed for CORS

🔒 **Before Going to Production:**
- Set strong MySQL password
- Set `APP_DEBUG=false`
- Configure specific CORS origins
- Enable HTTPS
- Use environment-specific configurations

---

**Last Updated:** December 29, 2024
**Laravel Version:** 10.x
**PHP Version:** 8.1+
**XAMPP Version:** 8.2.x
