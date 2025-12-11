# Fetch - Windows Setup Guide

## Quick Overview

This guide covers setting up Fetch on Windows. You have two main options:

1. **Docker (Recommended)** - Everything pre-configured
2. **Manual Setup** - Install dependencies yourself

---

## Option 1: Docker Setup (Easiest - Recommended)

### Prerequisites

1. **Install Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop
   - System requirements: Windows 10/11 Pro, Enterprise, or Education
   - Alternative: Download Docker Toolbox if using Home edition

2. **Verify Installation**
   ```powershell
   docker --version
   docker-compose --version
   ```

### Docker Quick Start

```powershell
# Navigate to project
cd C:\Users\Administrator\idk

# Start all services
docker-compose up -d

# Wait 30 seconds for MySQL to initialize

# Run migrations
docker-compose exec app php artisan migrate

# (Optional) Seed test data
docker-compose exec app php artisan db:seed

# View logs
docker-compose logs -f app
```

**Services will be available at:**
- API: `http://localhost/api`
- MySQL: `localhost:3306` (user: `fetch_user`, password: `password`)
- PhpMyAdmin (optional): http://localhost:8080

### Docker Commands

```powershell
# View all containers
docker-compose ps

# Stop services
docker-compose down

# Restart services
docker-compose restart app

# Execute artisan commands
docker-compose exec app php artisan <command>

# Access application shell
docker-compose exec app sh

# View MySQL data
docker-compose exec mysql mysql -u fetch_user -p

# View logs
docker-compose logs -f app
docker-compose logs -f mysql
```

---

## Option 2: Manual Setup (Windows)

### Step 1: Install Dependencies

#### Install PHP 8.1

1. Download from: https://windows.php.net/download/
2. Choose **VC16 x64 Thread Safe** version
3. Extract to `C:\php` (or preferred location)
4. Add to System PATH:
   - Right-click "This PC" → Properties
   - Advanced system settings
   - Environment Variables
   - Add `C:\php` to PATH

Verify installation:
```powershell
php --version
```

#### Install Composer

1. Download: https://getcomposer.org/download/
2. Run installer (choose PHP path when prompted)

Verify:
```powershell
composer --version
```

#### Install MySQL 8.0

1. Download: https://dev.mysql.com/downloads/mysql/
2. Run installer
3. Choose "MySQL Server" and "MySQL Workbench"
4. Configure with default settings
5. Note: username: `root`, set your own password

Verify:
```powershell
# Add MySQL to PATH if not done automatically
# Typically: C:\Program Files\MySQL\MySQL Server 8.0\bin

mysql --version
```

#### Install Git (Optional but Recommended)

Download: https://git-scm.com/download/win

### Step 2: Create Database

Using MySQL Workbench (GUI):
1. Open MySQL Workbench
2. Click "+" next to MySQL Connections
3. Set up connection to `localhost:3306`
4. Connect
5. Run SQL: `CREATE DATABASE fetch;`

Or using Command Prompt:
```powershell
# Open PowerShell as Administrator

mysql -u root -p
# (Enter your MySQL password)

# In MySQL prompt:
CREATE DATABASE fetch;
EXIT;
```

### Step 3: Setup Laravel Project

```powershell
cd C:\Users\Administrator\idk

# Install dependencies
composer install

# Copy environment file
Copy-Item .env.example .env

# Generate application key
php artisan key:generate

# Update .env with database credentials
# Edit .env file:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=fetch
# DB_USERNAME=root
# DB_PASSWORD=your_mysql_password
```

### Step 4: Configure Pusher

1. Sign up at https://pusher.com
2. Create new app
3. Edit `.env`:
```
PUSHER_APP_ID=your_id
PUSHER_APP_KEY=your_key
PUSHER_APP_SECRET=your_secret
PUSHER_APP_CLUSTER=mt1
```

### Step 5: Run Migrations

```powershell
php artisan migrate
```

Expected output:
```
Migration table created successfully.
Migrating: 2024_01_01_000000_create_users_table
...
Database migration completed successfully.
```

### Step 6: Start Development Server

**Terminal 1** - Start Laravel:
```powershell
php artisan serve
```

Output should show:
```
Laravel development server started: http://127.0.0.1:8000
```

**Terminal 2** - Start Queue Worker:
```powershell
php artisan queue:work database
```

API available at: `http://localhost:8000/api`

---

## Testing Installation

### Quick Test

```powershell
# Check API is running
curl http://localhost:8000/api/health

# Expected response:
# {"status":"ok"}
```

### Register Test User

```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    password_confirmation = "password123"
    phone_number = "5551234567"
    role = "passenger"
} | ConvertTo-Json

curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -Body $body
```

---

## Troubleshooting Windows Setup

### Issue: "php: The term 'php' is not recognized"

**Solution**: Add PHP to PATH
1. Find PHP installation directory (e.g., `C:\php`)
2. System Properties → Environment Variables
3. Add PHP path to PATH variable
4. Restart PowerShell

### Issue: MySQL not found

**Solution**: Add MySQL to PATH
```powershell
# In PowerShell (as Administrator):
[Environment]::SetEnvironmentVariable("Path", "$env:Path;C:\Program Files\MySQL\MySQL Server 8.0\bin", "Machine")

# Restart PowerShell
```

### Issue: "Port 8000 is already in use"

```powershell
# Use different port
php artisan serve --port=8001

# API will be at http://localhost:8001/api
```

### Issue: "Access denied for user 'root'@'localhost'"

```powershell
# Verify MySQL is running
# Try connecting directly:
mysql -u root -p

# If fails, restart MySQL Service:
# Services → Find "MySQL80" → Right-click Restart
```

### Issue: "Could not find driver (SQL: select..."

```powershell
# PHP MySQL driver not installed
# Edit php.ini (in C:\php\):
# Uncomment: extension=pdo_mysql

# Restart server
```

### Issue: Composer memory error

```powershell
php -d memory_limit=-1 $(which composer) install
```

---

## Windows-Specific Commands

```powershell
# Database operations
php artisan migrate:refresh     # Reset migrations
php artisan db:seed             # Seed test data

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# View logs
Get-Content storage/logs/laravel.log -Tail 100 -Wait

# Update dependencies
composer update

# Check artisan commands
php artisan list
```

---

## Using PowerShell Effectively

### Create Aliases for Common Commands

```powershell
# Add to PowerShell profile (notepad $PROFILE):

function artisan {
    php artisan $args
}

function migrate {
    php artisan migrate $args
}

function serve {
    php artisan serve $args
}

function queue {
    php artisan queue:work database $args
}

# Now you can use:
# artisan migrate
# serve
# queue
```

---

## Recommended Windows Tools

1. **Windows Terminal** - Better than PowerShell
   - Download from Microsoft Store
   - Supports multiple tabs and splits

2. **Visual Studio Code**
   - Extensions: Laravel Snippets, REST Client, MySQL

3. **MySQL Workbench**
   - GUI for database management
   - Included with MySQL installer

4. **Postman or Insomnia**
   - REST API testing
   - Better than curl for Windows

5. **TablePlus**
   - Database explorer
   - Works with MySQL

---

## Performance Tips for Windows

1. **Disable Windows Defender for Dev Folder**
   - Can slow down file operations
   - Settings → Virus & Threat Protection → Exclusions

2. **Use SSD**
   - Install Laravel project on SSD, not HDD

3. **Use Docker**
   - More performant than manual Windows setup
   - Native virtualization better on Windows 11

4. **Increase PHP memory**
   - Edit php.ini: `memory_limit = 512M`

---

## Next Steps

After successful setup:

1. ✅ Verify API is running
2. 📖 Read `QUICK_START.md` for testing workflows
3. 📚 Review `API_DOCUMENTATION.md` for endpoints
4. 🚀 Check `DEPLOYMENT.md` for production setup
5. 💻 Start building frontend

---

## Support

If you encounter issues:

1. Check relevant troubleshooting section
2. View Laravel logs: `Get-Content storage/logs/laravel.log`
3. Check queue failed jobs: `php artisan queue:failed`
4. Google the error message + "Laravel"
5. Ask on Laravel forums: https://laracasts.com/discuss

---

## Quick Reference

| Task | Command |
|------|---------|
| Start server | `php artisan serve` |
| Queue worker | `php artisan queue:work database` |
| Run migrations | `php artisan migrate` |
| Reset database | `php artisan migrate:refresh` |
| Seed data | `php artisan db:seed` |
| Clear cache | `php artisan cache:clear` |
| View logs | `Get-Content storage/logs/laravel.log` |
| Database shell | `mysql -u root -p fetch` |
| Docker start | `docker-compose up -d` |
| Docker stop | `docker-compose down` |

---

**Recommended**: Use Docker for easiest setup on Windows!

**Last Updated**: December 12, 2025
