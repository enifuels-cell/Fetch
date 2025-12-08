# Deployment Guide

This guide covers different deployment options for the Motorcycle Booking System.

## Prerequisites

- Node.js v14+ installed
- MongoDB instance (local or cloud)
- Git

## Environment Variables

Before deploying, ensure you have the following environment variables configured:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_very_secure_secret_key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_admin_password
```

⚠️ **Security Notes:**
- Use a strong, unique JWT_SECRET (minimum 32 characters)
- Change default admin credentials before deployment
- Never commit .env files to version control
- Use different secrets for different environments

## Deployment Options

### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 globally
sudo npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd Fetch

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env  # Edit with your production values

# Create admin user
npm run create-admin

# Start with PM2
pm2 start server.js --name motorcycle-booking
pm2 save
pm2 startup
```

#### 3. Configure Nginx (Optional but recommended)

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/motorcycle-booking
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/motorcycle-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Setup SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Heroku

#### 1. Prerequisites
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

#### 2. Deploy
```bash
# Create Heroku app
heroku create your-app-name

# Set MongoDB (use MongoDB Atlas)
heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"

# Set other environment variables
heroku config:set JWT_SECRET="your_secure_secret"
heroku config:set JWT_EXPIRE="7d"
heroku config:set NODE_ENV="production"
heroku config:set ADMIN_EMAIL="admin@yourdomain.com"
heroku config:set ADMIN_PASSWORD="secure_password"

# Deploy
git push heroku main

# Create admin user
heroku run npm run create-admin
```

### Option 3: Railway.app

#### 1. Setup
- Go to [railway.app](https://railway.app)
- Sign in with GitHub
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository

#### 2. Configure Environment Variables
In Railway dashboard:
- Go to Variables tab
- Add all environment variables from .env.example
- Add MongoDB connection string

#### 3. Deploy
Railway automatically deploys on git push to main branch.

### Option 4: Render.com

#### 1. Setup
- Go to [render.com](https://render.com)
- Create New Web Service
- Connect your GitHub repository
- Choose "Node" environment

#### 2. Configuration
```yaml
# Build Command
npm install

# Start Command
npm start
```

#### 3. Environment Variables
Add in Render dashboard:
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRE
- NODE_ENV=production
- ADMIN_EMAIL
- ADMIN_PASSWORD

### Option 5: Docker

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/motorcycle-booking
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRE=7d
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

#### 3. Deploy

```bash
# Build and run
docker-compose up -d

# Create admin user
docker-compose exec app npm run create-admin

# View logs
docker-compose logs -f app
```

## MongoDB Setup

### Option A: MongoDB Atlas (Recommended for Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (or allow from anywhere: 0.0.0.0/0)
5. Get connection string
6. Update MONGODB_URI in environment variables

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/motorcycle-booking?retryWrites=true&w=majority
```

### Option B: Local MongoDB

```bash
# Install MongoDB
sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Connection string
MONGODB_URI=mongodb://localhost:27017/motorcycle-booking
```

## Post-Deployment Steps

### 1. Create Admin User
```bash
npm run create-admin
```

### 2. Test API
```bash
# Check if API is running
curl https://yourdomain.com

# Test registration
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "user"
  }'
```

### 3. Monitor Application

#### Using PM2
```bash
# View logs
pm2 logs motorcycle-booking

# Monitor resources
pm2 monit

# Restart
pm2 restart motorcycle-booking

# View status
pm2 status
```

#### Using Docker
```bash
# View logs
docker-compose logs -f app

# Restart
docker-compose restart app

# Stop
docker-compose down

# Start
docker-compose up -d
```

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific origins only
- [ ] Keep dependencies updated
- [ ] Set NODE_ENV to production
- [ ] Use environment variables for secrets
- [ ] Set up regular database backups
- [ ] Monitor application logs
- [ ] Implement additional rate limiting if needed
- [ ] Set up firewall rules
- [ ] Use secure MongoDB connection string
- [ ] Enable MongoDB authentication
- [ ] Regular security updates

## Performance Optimization

### 1. Enable Compression
```bash
npm install compression
```

Add to server.js:
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Add Caching
Install Redis and implement caching for frequently accessed data.

### 3. Database Indexing
MongoDB automatically indexes _id, but add custom indexes:
```javascript
// In models
userSchema.index({ email: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
riderSchema.index({ user: 1 });
```

### 4. Enable Clustering
Use PM2 cluster mode:
```bash
pm2 start server.js -i max
```

## Monitoring

### Setup Application Monitoring

1. **PM2 Plus** (Free tier available)
```bash
pm2 plus
```

2. **Sentry** for Error Tracking
```bash
npm install @sentry/node
```

3. **New Relic** for APM

4. **Datadog** for Infrastructure Monitoring

## Backup Strategy

### Database Backups

#### Automated MongoDB Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh
```

## Scaling Strategies

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Upgrade MongoDB instance

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple app instances
- Use MongoDB replica set

### Database Scaling
- MongoDB sharding
- Read replicas
- Connection pooling

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs
# or
docker-compose logs

# Check MongoDB connection
mongo $MONGODB_URI

# Check port availability
lsof -i :3000
```

### High Memory Usage
```bash
# Restart application
pm2 restart all

# Check for memory leaks
pm2 monit
```

### Database Connection Issues
- Verify MongoDB is running
- Check connection string
- Verify network access (firewall, security groups)
- Check MongoDB authentication

## Rollback Strategy

### Using Git
```bash
# View commit history
git log --oneline

# Rollback to previous version
git checkout <commit-hash>
pm2 restart motorcycle-booking
```

### Using PM2
```bash
# Save current state
pm2 save

# If something goes wrong
git checkout main
npm install
pm2 restart motorcycle-booking
```

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review logs weekly
- Check disk space weekly
- Database optimization monthly
- Security updates as available

### Update Process
```bash
# Backup first
mongodump --uri="$MONGODB_URI" --out="/backups/pre-update"

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart
pm2 restart motorcycle-booking

# Monitor
pm2 logs
```

## Support

For issues during deployment:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review security settings
5. Check firewall rules

## Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
