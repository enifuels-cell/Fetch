# Fetch - Setup Instructions

## Overview

Fetch is a production-ready Laravel motorcycle ride-booking system with real-time notifications and location-based rider matching.

## System Requirements

- **PHP**: 8.1 or higher
- **MySQL**: 5.7 or higher
- **Node.js**: 16+ (optional, for frontend development)
- **Composer**: Latest version
- **Redis**: Optional (for caching and queue)
- **Pusher Account**: For real-time notifications

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/fetch.git
cd fetch
```

### 2. Install Dependencies

```bash
composer install
```

### 3. Environment Configuration

```bash
# Create .env file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup

Update `.env` with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fetch
DB_USERNAME=root
DB_PASSWORD=your_password
```

Create the database:

```bash
mysql -u root -p -e "CREATE DATABASE fetch;"
```

**Windows Users**: If you don't have MySQL installed, see **WINDOWS_SETUP.md** for complete Windows setup instructions including Docker setup (recommended).

Run migrations:

```bash
php artisan migrate
```

(Optional) Seed test data:

```bash
php artisan db:seed
```

### 5. Configure Pusher

1. Sign up at https://pusher.com
2. Create a new app
3. Update `.env`:

```env
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1
```

### 6. Start Development Server

Terminal 1 - Start Laravel:
```bash
php artisan serve
```

Terminal 2 - Start Queue Worker:
```bash
php artisan queue:work database
```

API will be available at: `http://localhost:8000/api`

---

## Docker Setup

### Quick Start with Docker

```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate

# Create test data (optional)
docker-compose exec app php artisan db:seed

# View logs
docker-compose logs -f app
```

Services:
- **App**: http://localhost (Laravel FPM)
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

### Docker Commands Reference

```bash
# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Execute artisan commands
docker-compose exec app php artisan tinker

# Access app shell
docker-compose exec app /bin/sh

# View database
docker-compose exec mysql mysql -u fetch_user -p fetch
```

---

## Project Structure

```
fetch/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── BookingController.php
│   │   │   ├── LocationController.php
│   │   │   ├── NotificationController.php
│   │   │   └── ReviewController.php
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Booking.php
│   │   ├── Notification.php
│   │   └── Review.php
│   ├── Services/
│   │   ├── RiderMatchingService.php
│   │   ├── NotificationService.php
│   │   └── FareCalculationService.php
│   └── Providers/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── routes/
│   └── api.php
├── config/
│   ├── broadcasting.php
│   ├── database.php
│   ├── queue.php
│   └── cache.php
├── storage/
├── tests/
├── .env.example
├── composer.json
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── README.md
├── API_DOCUMENTATION.md
├── QUICK_START.md
├── DEPLOYMENT.md
└── SETUP.md (this file)
```

---

## Configuration Files Overview

### .env File

```env
APP_NAME="Fetch"
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:xxxx...
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fetch
DB_USERNAME=root
DB_PASSWORD=

# Broadcasting (Pusher)
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

# Queue
QUEUE_CONNECTION=database

# Cache
CACHE_DRIVER=file

# Mail
MAIL_MAILER=log
```

### Database Configuration

The system uses 4 main tables:
- **users**: Store passenger and rider information
- **bookings**: Store booking records and status
- **notifications**: Store push notifications
- **reviews**: Store ratings and reviews

---

## API Testing

### Register Test Users

Save tokens for later use:

```bash
# Register as passenger
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Passenger",
    "email": "passenger@test.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "5551234567",
    "role": "passenger"
  }'

# Register as rider
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Rider",
    "email": "rider@test.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "5559876543",
    "role": "rider"
  }'
```

### Complete Test Flow

1. **Rider goes online**
```bash
curl -X POST http://localhost:8000/api/location/go-online \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7130,
    "longitude": -74.0059
  }'
```

2. **Passenger creates booking**
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer PASSENGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_latitude": 40.7128,
    "pickup_longitude": -74.0060,
    "pickup_address": "123 Main Street",
    "dropoff_latitude": 40.7589,
    "dropoff_longitude": -73.9851,
    "dropoff_address": "Times Square"
  }'
```

3. **Rider accepts booking**
```bash
curl -X POST http://localhost:8000/api/bookings/1/accept \
  -H "Authorization: Bearer RIDER_TOKEN"
```

4. **View notifications**
```bash
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer RIDER_TOKEN"
```

---

## Troubleshooting

### PHP Extensions Missing

```bash
# Check installed extensions
php -m | grep -i mbstring

# On Ubuntu/Debian
sudo apt-get install php8.1-mbstring php8.1-bcmath php8.1-xml
```

### Database Connection Error

1. Verify MySQL is running: `mysql -u root -p`
2. Check `.env` database credentials
3. Ensure database exists: `CREATE DATABASE fetch;`

### Composer Memory Error

```bash
php -d memory_limit=-1 $(which composer) install
```

### Queue Not Processing

1. Check queue is running: `php artisan queue:work database`
2. Verify jobs table exists: `php artisan queue:table && php artisan migrate`
3. Check failed jobs: `php artisan queue:failed`

### CORS Errors

Edit `config/cors.php`:
```php
'allowed_origins' => ['*'],  // For development only
```

---

## Development Best Practices

### Code Style

Follow PSR-12 standards. Format code with:

```bash
./vendor/bin/pint
```

### Testing

(Add tests after initial setup)

```bash
php artisan test
```

### Debugging

Use Laravel Tinker:

```bash
php artisan tinker

# Examples:
>>> User::first()
>>> DB::table('users')->count()
```

---

## Environment Variables Cheat Sheet

| Variable | Purpose | Example |
|----------|---------|---------|
| APP_DEBUG | Enable debug mode | true (dev only) |
| DB_HOST | Database host | 127.0.0.1 |
| DB_DATABASE | Database name | fetch |
| PUSHER_APP_ID | Pusher app ID | 1234567 |
| BROADCAST_DRIVER | Notification driver | pusher |
| QUEUE_CONNECTION | Queue driver | database |

---

## Next Steps

1. ✅ Complete local development setup
2. 📚 Read API_DOCUMENTATION.md for all endpoints
3. 🚀 Review DEPLOYMENT.md for production setup
4. 💻 Build frontend (React/Vue)
5. 🔒 Implement additional security measures
6. 📊 Set up monitoring and logging

---

## Support Resources

- **Laravel Docs**: https://laravel.com/docs
- **Pusher Docs**: https://pusher.com/docs
- **Sanctum Docs**: https://laravel.com/docs/sanctum
- **Docker Docs**: https://docs.docker.com

---

## Quick Commands Reference

```bash
# Core Laravel
php artisan serve                    # Start dev server
php artisan migrate                  # Run migrations
php artisan tinker                   # Interactive shell
php artisan cache:clear              # Clear cache
php artisan config:cache             # Cache config (production)

# Database
php artisan migrate:refresh          # Reset migrations
php artisan db:seed                  # Run seeders
php artisan make:migration name      # Create migration

# Queue
php artisan queue:work               # Process jobs
php artisan queue:failed             # View failed jobs
php artisan queue:retry all          # Retry failed jobs

# Debugging
php artisan logs:tail                # View logs in real-time
php artisan route:list               # List all routes
php artisan model:show User          # Show model info
```

---

Last Updated: December 12, 2025
