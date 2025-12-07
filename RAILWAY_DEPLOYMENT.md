# 🚂 Railway.app Deployment - Step by Step

## Prerequisites
- GitHub account
- Railway.app account (sign up with GitHub)

---

## Step 1: Push Code to GitHub

### 1.1 Create a GitHub Repository
1. Go to github.com
2. Click "New repository"
3. Name it: `chat-app`
4. Make it **Public** or **Private**
5. Click "Create repository"

### 1.2 Push Your Code
```bash
# In your project folder
git init
git add .
git commit -m "Initial commit - Chat application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chat-app.git
git push -u origin main
```

---

## Step 2: Sign Up for Railway

1. Go to **railway.app**
2. Click **"Start a New Project"**
3. Sign in with **GitHub**
4. Authorize Railway to access your repositories

---

## Step 3: Create a New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **chat-app** repository
4. Railway will detect your Docker setup

---

## Step 4: Add Database Services

### 4.1 Add MongoDB
1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"MongoDB"**
4. Railway will provision a MongoDB instance
5. Copy the **Connection String** (looks like: `mongodb://...`)

### 4.2 Add Redis
1. Click **"+ New"** again
2. Select **"Database"**
3. Choose **"Redis"**
4. Copy the **Connection String** (looks like: `redis://...`)

### 4.3 Add RabbitMQ (Optional - use CloudAMQP)
1. Go to **cloudamqp.com**
2. Sign up for free tier
3. Create instance
4. Copy connection URL

---

## Step 5: Deploy Each Service Separately

Railway works best with separate services. You'll need to deploy each microservice individually.

### 5.1 Deploy Gateway Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Set **Root Directory**: `services/gateway`
4. Add Environment Variables:
   ```
   PORT=4000
   AUTH_SERVICE_URL=https://your-auth-service.railway.app
   USER_SERVICE_URL=https://your-user-service.railway.app
   CHAT_SERVICE_URL=https://your-chat-service.railway.app
   NOTIFICATION_SERVICE_URL=https://your-notification-service.railway.app
   REDIS_URL=<your-redis-connection-string>
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```
5. Click **"Deploy"**
6. Copy the public URL (e.g., `https://gateway-production-abc.railway.app`)

### 5.2 Deploy Auth Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Set **Root Directory**: `services/auth`
4. Add Environment Variables:
   ```
   PORT=4001
   MONGODB_URI=<your-mongodb-connection-string>/chat-auth
   REDIS_URL=<your-redis-connection-string>
   RABBITMQ_URL=<your-rabbitmq-connection-string>
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   ```
5. Click **"Deploy"**
6. Copy the public URL

### 5.3 Deploy User Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Set **Root Directory**: `services/user`
3. Add Environment Variables:
   ```
   PORT=4002
   MONGODB_URI=<your-mongodb-connection-string>/chat-users
   REDIS_URL=<your-redis-connection-string>
   RABBITMQ_URL=<your-rabbitmq-connection-string>
   ```
4. Click **"Deploy"**
5. Copy the public URL

### 5.4 Deploy Chat Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Set **Root Directory**: `services/chat`
3. Add Environment Variables:
   ```
   PORT=4003
   MONGODB_URI=<your-mongodb-connection-string>/chat-messages
   REDIS_URL=<your-redis-connection-string>
   RABBITMQ_URL=<your-rabbitmq-connection-string>
   ```
4. Click **"Deploy"**
5. Copy the public URL

### 5.5 Deploy Notification Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Set **Root Directory**: `services/notification`
3. Add Environment Variables:
   ```
   PORT=4004
   REDIS_URL=<your-redis-connection-string>
   RABBITMQ_URL=<your-rabbitmq-connection-string>
   ```
4. Click **"Deploy"**
5. Copy the public URL

### 5.6 Deploy Frontend

1. Click **"+ New"** → **"GitHub Repo"**
2. Set **Root Directory**: `frontend`
3. No environment variables needed (it proxies to gateway)
4. Click **"Deploy"**
5. Copy the public URL - **This is your app URL!** 🎉

---

## Step 6: Update Gateway Environment Variables

Go back to your **Gateway Service** and update the service URLs:

```
AUTH_SERVICE_URL=https://your-auth-service-abc.railway.app
USER_SERVICE_URL=https://your-user-service-xyz.railway.app
CHAT_SERVICE_URL=https://your-chat-service-def.railway.app
NOTIFICATION_SERVICE_URL=https://your-notification-service-ghi.railway.app
FRONTEND_URL=https://your-frontend-jkl.railway.app
```

Click **"Redeploy"** after updating.

---

## Step 7: Test Your App

1. Open your frontend URL: `https://your-frontend-abc.railway.app`
2. Register a new account
3. Login
4. Start chatting! 🎉

---

## Alternative: Simpler Approach (Monolith)

If deploying multiple services is too complex, you can deploy everything as one:

### Create a Simple Deployment

1. **Combine all services** into one Docker container
2. **Use Railway's built-in databases**
3. **Deploy as single service**

Would you like me to create a simplified single-service version?

---

## Troubleshooting

### Services can't connect to each other
- Make sure all service URLs are correct
- Check environment variables
- Verify services are running (green status)

### Database connection failed
- Check MongoDB/Redis connection strings
- Make sure databases are running
- Verify network access

### Frontend can't reach backend
- Update CORS settings in gateway
- Check FRONTEND_URL environment variable
- Verify all services are deployed

---

## Cost

Railway offers:
- **$5 free credit per month**
- **$0.000463 per GB-hour** for compute
- **$0.25 per GB** for storage

Your app should stay within free tier for testing!

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Sign up for Railway
3. ✅ Add databases
4. ✅ Deploy services
5. ✅ Update environment variables
6. ✅ Test your app
7. 🎉 Share with friends!

---

## Need Help?

If Railway seems too complex, I can help you with:
1. **Render.com** - Similar but simpler
2. **Heroku** - Classic platform
3. **DigitalOcean** - More control

Let me know!
