# 🔧 Fix 502 Bad Gateway Error

## What's Happening

The **502 Bad Gateway** error means the gateway service can't reach the auth service. This is common on Render's free tier.

## Why This Happens on Render Free Tier

1. **Services spin down** after 15 minutes of inactivity
2. **First request takes 30-60 seconds** to wake up the service
3. **Gateway times out** waiting for auth service to respond
4. You see **502 error**

## ✅ Quick Fix (Try This First)

### Option 1: Wait and Retry
1. **Wait 60 seconds** for services to wake up
2. **Refresh the page**
3. **Try logging in again**

The services should be awake now and respond properly.

### Option 2: Wake Up Services Manually

Open these URLs in new tabs to wake up each service:

1. **Auth Service**: https://chat-auth.onrender.com/health
2. **User Service**: https://chat-user.onrender.com/health
3. **Chat Service**: https://chat-chat.onrender.com/health
4. **Gateway Service**: https://chat-gateway-lfj7.onrender.com/health

Wait for each to respond (may take 30-60 seconds), then try your app again.

## 🔍 Check Service Status

Go to your Render Dashboard: https://dashboard.render.com

Check each service:
- ✅ **Green "Live"** = Service is running
- 🟡 **Yellow "Building"** = Service is deploying
- 🔴 **Red "Failed"** = Service crashed (needs fixing)
- ⚪ **Gray "Suspended"** = Service is sleeping

## 🐛 If Services Keep Failing

### Check 1: Verify Environment Variables

Each service needs these environment variables set on Render:

**Gateway Service:**
- `JWT_SECRET` (must match auth service!)
- `REDIS_URL`
- `AUTH_SERVICE_URL` = `https://chat-auth.onrender.com`
- `USER_SERVICE_URL` = `https://chat-user.onrender.com`
- `CHAT_SERVICE_URL` = `https://chat-chat.onrender.com`

**Auth Service:**
- `JWT_SECRET` (must match gateway!)
- `JWT_REFRESH_SECRET`
- `MONGODB_URI`
- `REDIS_URL`
- `RABBITMQ_URL`

**User Service:**
- `MONGODB_URI`
- `REDIS_URL`
- `RABBITMQ_URL`

**Chat Service:**
- `MONGODB_URI`
- `REDIS_URL`
- `RABBITMQ_URL`

### Check 2: View Service Logs

For each service on Render:
1. Click on the service
2. Go to "Logs" tab
3. Look for errors

Common errors:
- `ECONNREFUSED` = Can't connect to database
- `Authentication failed` = Wrong database credentials
- `Module not found` = Build issue

### Check 3: Verify Database Connections

**MongoDB Atlas:**
- Go to https://cloud.mongodb.com
- Check cluster is running
- Verify connection string is correct
- Make sure IP whitelist includes `0.0.0.0/0` (allow all)

**Upstash Redis:**
- Go to https://console.upstash.com
- Check database is active
- Verify connection URL is correct

**CloudAMQP:**
- Go to https://customer.cloudamqp.com
- Check instance is running
- Verify connection URL is correct

## 🚀 Long-Term Solution: Keep Services Awake

Render free tier services sleep after 15 minutes. Here are solutions:

### Option 1: Use a Ping Service (Free)

Use a service like **UptimeRobot** or **Cron-job.org** to ping your services every 10 minutes:

**URLs to ping:**
- https://chat-gateway-lfj7.onrender.com/health
- https://chat-auth.onrender.com/health
- https://chat-user.onrender.com/health
- https://chat-chat.onrender.com/health

This keeps them awake during the day.

### Option 2: Upgrade to Paid Plan

Render's paid plans ($7/month per service) don't spin down:
- Always available
- Faster response times
- Better for production

### Option 3: Add Health Check Endpoint

I can add a health check that pings other services to keep them awake.

## 📊 Current Service URLs

Based on your configuration:

| Service | URL |
|---------|-----|
| Frontend | https://chat-frontend-r61x.onrender.com |
| Gateway | https://chat-gateway-lfj7.onrender.com |
| Auth | https://chat-auth.onrender.com |
| User | https://chat-user.onrender.com |
| Chat | https://chat-chat.onrender.com |
| Notification | https://chat-notification.onrender.com |

## 🧪 Test Each Service

Run these commands to test each service:

```bash
# Test Gateway
curl https://chat-gateway-lfj7.onrender.com/health

# Test Auth
curl https://chat-auth.onrender.com/health

# Test User
curl https://chat-user.onrender.com/health

# Test Chat
curl https://chat-chat.onrender.com/health
```

Each should return: `{"status":"healthy","service":"..."}`

## ⚡ Quick Recovery Steps

When you see 502 error:

1. **Open Render Dashboard**
2. **Check which service is down** (look for red/gray status)
3. **Click "Manual Deploy"** on that service
4. **Wait 2-3 minutes** for deployment
5. **Try your app again**

## 🎯 Most Common Causes

1. **Services sleeping** (free tier) - Wait 60 seconds
2. **Database connection failed** - Check MongoDB/Redis/RabbitMQ
3. **Environment variables missing** - Check Render dashboard
4. **Service crashed** - Check logs for errors
5. **Build failed** - Check build logs

## 💡 Pro Tips

1. **First login of the day takes longer** - Services need to wake up
2. **Keep a tab open** - Prevents services from sleeping
3. **Check logs first** - They tell you exactly what's wrong
4. **Test health endpoints** - Quick way to wake services
5. **Set up monitoring** - Use UptimeRobot to get alerts

## 🆘 Still Not Working?

If you've tried everything:

1. **Check Render Status**: https://status.render.com
2. **Verify all environment variables** are set correctly
3. **Check database services** (MongoDB, Redis, RabbitMQ) are running
4. **Review service logs** for specific errors
5. **Try manual redeploy** of all services

---

**Most likely:** Your services are just sleeping. Wait 60 seconds and try again! 😊
