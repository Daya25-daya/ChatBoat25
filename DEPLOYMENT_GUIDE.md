# 🚀 Deployment Guide - Publishing Your Chat App

## Option 1: Deploy to a Cloud Server (Recommended)

### A. Using DigitalOcean, AWS, or Azure

#### Step 1: Get a Server
1. **DigitalOcean Droplet** ($6/month)
   - Go to digitalocean.com
   - Create a Droplet (Ubuntu 22.04)
   - Choose Basic plan ($6/month)
   - Add SSH key

2. **AWS EC2** (Free tier available)
   - Go to aws.amazon.com
   - Launch EC2 instance (t2.micro)
   - Choose Ubuntu 22.04

3. **Azure VM** (Free tier available)
   - Go to azure.microsoft.com
   - Create Virtual Machine
   - Choose Ubuntu 22.04

#### Step 2: Connect to Your Server
```bash
ssh root@your-server-ip
```

#### Step 3: Install Docker on Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### Step 4: Upload Your Code
```bash
# On your local machine
# Zip your project (exclude node_modules)
tar -czf chatapp.tar.gz --exclude='node_modules' --exclude='.git' .

# Upload to server
scp chatapp.tar.gz root@your-server-ip:/root/

# On server, extract
ssh root@your-server-ip
cd /root
tar -xzf chatapp.tar.gz
```

#### Step 5: Update Environment Variables
```bash
# Edit docker-compose.yml to use your domain
nano docker-compose.yml

# Update FRONTEND_URL to your domain
# Example: FRONTEND_URL: https://yourchatapp.com
```

#### Step 6: Start the Application
```bash
docker-compose up -d
```

#### Step 7: Get a Domain Name
1. Buy domain from **Namecheap**, **GoDaddy**, or **Google Domains** ($10-15/year)
2. Point domain A record to your server IP
3. Wait 5-10 minutes for DNS propagation

#### Step 8: Setup SSL (HTTPS)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

---

## Option 2: Deploy to Heroku (Easiest)

### Requirements:
- Heroku account (free tier available)
- Heroku CLI installed

### Steps:

1. **Install Heroku CLI**
```bash
# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Mac
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku Apps** (one for each service)
```bash
heroku create your-chat-gateway
heroku create your-chat-auth
heroku create your-chat-user
heroku create your-chat-chat
heroku create your-chat-notification
heroku create your-chat-frontend
```

4. **Add MongoDB Atlas** (Free tier)
- Go to mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Add to Heroku config vars

5. **Add Redis Cloud** (Free tier)
- Go to redis.com/try-free
- Create free database
- Get connection string
- Add to Heroku config vars

6. **Deploy Each Service**
```bash
# For each service
cd services/gateway
git init
heroku git:remote -a your-chat-gateway
git add .
git commit -m "Deploy"
git push heroku main
```

---

## Option 3: Deploy to Railway.app (Recommended for Beginners)

### Why Railway?
- ✅ Free $5 credit monthly
- ✅ Automatic HTTPS
- ✅ Easy deployment
- ✅ Built-in databases

### Steps:

1. **Sign up at railway.app**
2. **Click "New Project"**
3. **Deploy from GitHub**
   - Connect your GitHub account
   - Push your code to GitHub
   - Select repository
   - Railway auto-detects Docker
4. **Add Services**
   - MongoDB
   - Redis
   - RabbitMQ
5. **Set Environment Variables**
6. **Get Public URL** (automatic)

---

## Option 4: Deploy to Render.com (Free Tier)

### Steps:

1. **Sign up at render.com**
2. **Create Web Services** for each microservice
3. **Create Databases**:
   - PostgreSQL (free)
   - Redis (free)
4. **Deploy**:
   - Connect GitHub
   - Auto-deploy on push
5. **Get Public URL**

---

## Option 5: Use Ngrok (For Testing Only)

### Quick Public URL (Temporary)

```bash
# Install ngrok
# Download from: https://ngrok.com/download

# Start your app
docker-compose up -d

# Expose port 3000
ngrok http 3000

# You'll get a public URL like: https://abc123.ngrok.io
```

**Note:** Ngrok URLs are temporary and change on restart. Good for testing only.

---

## Recommended Setup for Production

### Best Option: DigitalOcean + Domain + SSL

**Monthly Cost:** ~$20
- DigitalOcean Droplet: $6/month
- Domain: $1/month (annual)
- SSL: Free (Let's Encrypt)
- MongoDB Atlas: Free tier
- Redis Cloud: Free tier

### Steps Summary:
1. ✅ Get DigitalOcean droplet ($6/month)
2. ✅ Buy domain name ($10-15/year)
3. ✅ Install Docker on server
4. ✅ Upload your code
5. ✅ Point domain to server
6. ✅ Setup SSL with Certbot
7. ✅ Start application
8. ✅ Your app is live! 🎉

---

## Environment Variables for Production

Update these in your `docker-compose.yml`:

```yaml
environment:
  # Change to your domain
  FRONTEND_URL: https://yourdomain.com
  
  # Use strong secrets
  JWT_SECRET: your-super-secret-key-here-change-this
  JWT_REFRESH_SECRET: your-refresh-secret-key-here
  
  # Use production database URLs
  MONGODB_URI: mongodb+srv://user:pass@cluster.mongodb.net/chatapp
  REDIS_URL: redis://user:pass@redis-host:6379
  RABBITMQ_URL: amqp://user:pass@rabbitmq-host:5672
```

---

## Security Checklist Before Going Live

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall (UFW)
- [ ] Enable rate limiting
- [ ] Set up backups
- [ ] Add monitoring (UptimeRobot)
- [ ] Configure CORS properly
- [ ] Use environment variables
- [ ] Enable Docker restart policies

---

## Quick Start Script for DigitalOcean

Save this as `deploy.sh`:

```bash
#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
apt install nginx -y

# Install Certbot
apt install certbot python3-certbot-nginx -y

# Setup firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo "✅ Server setup complete!"
echo "Next steps:"
echo "1. Upload your code"
echo "2. Run: docker-compose up -d"
echo "3. Setup SSL: certbot --nginx -d yourdomain.com"
```

---

## Need Help?

Choose the option that fits your needs:
- **Free Testing:** Ngrok or Railway
- **Easy Deployment:** Railway or Render
- **Full Control:** DigitalOcean + Domain
- **Enterprise:** AWS or Azure

Would you like me to help you with any specific deployment option?
