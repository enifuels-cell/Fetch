#!/bin/bash

# Fetch - Installation Script for Linux/Mac

set -e

echo "========================================="
echo "Fetch - Laravel Installation Script"
echo "========================================="

# Check if Laravel/PHP is installed
if ! command -v php &> /dev/null; then
    echo "Error: PHP is not installed. Please install PHP 8.1+ first."
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "Error: Composer is not installed. Please install Composer first."
    exit 1
fi

echo "✓ PHP and Composer found"

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
composer install

echo "✓ Dependencies installed"

# Generate application key
echo ""
echo "Generating application key..."
php artisan key:generate

echo "✓ Application key generated"

# Run migrations
echo ""
echo "Running database migrations..."
php artisan migrate

echo "✓ Database migrations completed"

# Create storage link
echo ""
echo "Creating storage link..."
php artisan storage:link 2>/dev/null || true

echo "✓ Storage link created"

# Set permissions
echo ""
echo "Setting file permissions..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache

echo "✓ File permissions set"

# Publish Sanctum config
echo ""
echo "Publishing Sanctum configuration..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" 2>/dev/null || true

echo "✓ Configuration published"

echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update your .env file with your database and Pusher credentials"
echo "2. Run: php artisan serve"
echo "3. In another terminal, run: php artisan queue:work database"
echo "4. API will be available at: http://localhost:8000/api"
echo ""
echo "For more information, see README.md and QUICK_START.md"
