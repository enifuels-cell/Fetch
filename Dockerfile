FROM php:8.1-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    wget \
    git \
    zip \
    unzip \
    mysql-client \
    libzip-dev \
    oniguruma-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    bcmath \
    ctype \
    fileinfo \
    json \
    mbstring \
    tokenizer \
    xml \
    zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Install project dependencies
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --prefer-dist

# Create necessary directories
RUN mkdir -p storage/logs \
    && mkdir -p bootstrap/cache

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage \
    && chown -R www-data:www-data /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Switch to www-data user
USER www-data

# Expose port
EXPOSE 9000

CMD ["php-fpm"]
