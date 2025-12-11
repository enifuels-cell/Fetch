# Fetch - Deployment Guide

## Deployment Options

### Option 1: Traditional VPS (Recommended for Production)

#### Prerequisites
- VPS with Ubuntu 20.04+ or similar
- SSH access
- Domain name (optional)
- SSL certificate (recommended)

#### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your_server_ip

# Update system
apt-get update && apt-get upgrade -y

# Install PHP and extensions
apt-get install -y php8.1-fpm php8.1-mysql php8.1-curl php8.1-xml php8.1-mbstring php8.1-bcmath php8.1-zip php8.1-redis

# Install Nginx
apt-get install -y nginx

# Install MySQL
apt-get install -y mysql-server

# Install Composer
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Git
apt-get install -y git
```

#### Step 2: Clone Repository

```bash
# Create app directory
mkdir -p /var/www/fetch
cd /var/www/fetch

# Clone your repository (or upload files)
git clone https://github.com/yourusername/fetch.git .

# Install dependencies
composer install --optimize-autoloader --no-dev
```

#### Step 3: Laravel Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create storage link
php artisan storage:link

# Run migrations
php artisan migrate --force

# Set permissions
chown -R www-data:www-data /var/www/fetch
chmod -R 755 /var/www/fetch/storage
chmod -R 755 /var/www/fetch/bootstrap/cache
```

#### Step 4: Nginx Configuration

Create `/etc/nginx/sites-available/fetch`:

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;
    root /var/www/fetch/public;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: maxcdn.bootstrapcdn.com;" always;

    index index.php index.html index.htm;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 100M;

    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name your_domain.com www.your_domain.com;
    root /var/www/fetch/public;

    ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: maxcdn.bootstrapcdn.com;" always;

    index index.php index.html index.htm;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 100M;
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/fetch /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Generate certificate
certbot certonly --nginx -d your_domain.com -d www.your_domain.com

# Auto-renewal is typically enabled by default
```

#### Step 6: Database Configuration

```bash
# Secure MySQL installation
mysql_secure_installation

# Create database and user
mysql -u root -p
```

```sql
CREATE DATABASE fetch;
CREATE USER 'fetch_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON fetch.* TO 'fetch_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Update `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=fetch
DB_USERNAME=fetch_user
DB_PASSWORD=strong_password
```

#### Step 7: Queue Worker (for notifications)

Create systemd service `/etc/systemd/system/fetch-queue.service`:

```ini
[Unit]
Description=Fetch Queue Worker
After=network.target

[Service]
User=www-data
Type=simple
WorkingDirectory=/var/www/fetch
ExecStart=/usr/bin/php /var/www/fetch/artisan queue:work database --tries=3
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
systemctl daemon-reload
systemctl enable fetch-queue
systemctl start fetch-queue
systemctl status fetch-queue
```

#### Step 8: Cron Job for Scheduling

Add to crontab:

```bash
crontab -e
```

Add:
```
* * * * * cd /var/www/fetch && php artisan schedule:run >> /dev/null 2>&1
```

---

### Option 2: Docker Deployment

#### Prerequisites
- Docker and Docker Compose installed
- Server with at least 2GB RAM

#### Deployment Steps

```bash
# Clone repository
git clone https://github.com/yourusername/fetch.git
cd fetch

# Configure environment
cp .env.example .env
nano .env  # Edit as needed

# Generate key
docker-compose exec app php artisan key:generate

# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate --force

# Create symbolic link for storage
docker-compose exec app php artisan storage:link

# Set proper permissions
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

#### Managing Docker Services

```bash
# View logs
docker-compose logs -f app

# Run artisan commands
docker-compose exec app php artisan <command>

# Access shell
docker-compose exec app /bin/bash

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

---

### Option 3: Shared Hosting (cPanel/Plesk)

#### Step 1: Upload Files

1. Connect via FTP
2. Upload all files to your public_html or designated folder
3. Ensure `public` folder is the document root

#### Step 2: Configuration

```bash
# Via SSH/Terminal
cp .env.example .env
php artisan key:generate
php artisan migrate
```

#### Step 3: Set Permissions

```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

#### Step 4: Configure cPanel

1. Set document root to `/public`
2. Enable PHP 8.1+
3. Ensure necessary extensions are installed
4. Configure cron job for queue worker

---

## Post-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan view:cache`
- [ ] Configure Pusher credentials
- [ ] Set up database backups
- [ ] Configure email service
- [ ] Set up monitoring/logging
- [ ] Configure firewall rules
- [ ] Enable HTTPS/SSL
- [ ] Set up CDN (optional)
- [ ] Configure rate limiting
- [ ] Test all API endpoints

---

## Monitoring & Maintenance

### Log Files

```bash
# Application logs
tail -f storage/logs/laravel.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# PHP-FPM logs
tail -f /var/log/php-fpm/error.log
```

### Database Backups

```bash
# Manual backup
mysqldump -u fetch_user -p fetch > backup_$(date +%Y%m%d).sql

# Automated daily backup (cron)
0 2 * * * mysqldump -u fetch_user -p fetch > /backups/fetch_$(date +\%Y\%m\%d).sql
```

### Performance Optimization

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### Common Commands

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Monitor queue
php artisan queue:monitor

# Restart queue worker
systemctl restart fetch-queue

# Check storage usage
du -sh /var/www/fetch
```

---

## Troubleshooting

### 503 Service Unavailable

```bash
# Check PHP-FPM status
systemctl status php8.1-fpm

# Restart services
systemctl restart php8.1-fpm
systemctl restart nginx
```

### Database Connection Error

```bash
# Test connection
php artisan tinker
> DB::connection()->getPDO();

# Check credentials in .env
# Verify MySQL is running
systemctl status mysql
```

### Queue Not Processing

```bash
# Check queue worker
systemctl status fetch-queue

# Restart queue worker
systemctl restart fetch-queue

# Check queue jobs
php artisan queue:failed
```

### Permission Denied Errors

```bash
# Fix storage permissions
chown -R www-data:www-data storage
chmod -R 755 storage

# Fix bootstrap permissions
chown -R www-data:www-data bootstrap/cache
chmod -R 755 bootstrap/cache
```

---

## Scaling for Production

1. **Load Balancing**: Use Nginx upstream or AWS ELB
2. **Database Replication**: Set up MySQL replication
3. **Caching**: Implement Redis for sessions and caching
4. **CDN**: Use CloudFlare or AWS CloudFront
5. **Monitoring**: Set up New Relic or Datadog
6. **Auto-scaling**: Use Docker Swarm or Kubernetes
7. **CI/CD Pipeline**: Implement GitHub Actions or GitLab CI

---

## Support

For deployment issues or questions, contact your hosting provider or refer to:
- Laravel Documentation: https://laravel.com/docs
- Nginx Documentation: https://nginx.org/en/docs
- Docker Documentation: https://docs.docker.com
