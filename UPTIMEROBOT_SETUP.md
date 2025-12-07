# 🤖 UptimeRobot Setup Guide - Keep Services Awake 24/7

## What is UptimeRobot?

UptimeRobot is a **FREE** monitoring service that will:
- ✅ Ping your services every 5 minutes
- ✅ Keep them awake 24/7 (no more 502 errors!)
- ✅ Send you email alerts if services go down
- ✅ Track uptime statistics
- ✅ Support up to 50 monitors for free

## 🚀 Step-by-Step Setup (5 Minutes)

### Step 1: Create Free Account

1. Go to: **https://uptimerobot.com**
2. Click **"Sign Up Free"** (top right)
3. Enter your email and create password
4. Verify your email
5. Login to dashboard

### Step 2: Add Your First Monitor (Gateway Service)

1. Click **"+ Add New Monitor"** button (big purple button)
2. Fill in the form:

```
Monitor Type: HTTP(s)
Friendly Name: Chat Gateway
URL: https://chat-gateway-lfj7.onrender.com/health
Monitoring Interval: Every 5 minutes
Monitor Timeout: 30 seconds
```

3. Click **"Create Monitor"**
4. ✅ Done! Gateway will stay awake now.

### Step 3: Add Auth Service Monitor

1. Click **"+ Add New Monitor"** again
2. Fill in:

```
Monitor Type: HTTP(s)
Friendly Name: Chat Auth
URL: https://chat-auth.onrender.com/health
Monitoring Interval: Every 5 minutes
Monitor Timeout: 30 seconds
```

3. Click **"Create Monitor"**

### Step 4: Add User Service Monitor

1. Click **"+ Add New Monitor"**
2. Fill in:

```
Monitor Type: HTTP(s)
Friendly Name: Chat User
URL: https://chat-user.onrender.com/health
Monitoring Interval: Every 5 minutes
Monitor Timeout: 30 seconds
```

3. Click **"Create Monitor"**

### Step 5: Add Chat Service Monitor

1. Click **"+ Add New Monitor"**
2. Fill in:

```
Monitor Type: HTTP(s)
Friendly Name: Chat Chat
URL: https://chat-chat.onrender.com/health
Monitoring Interval: Every 5 minutes
Monitor Timeout: 30 seconds
```

3. Click **"Create Monitor"**

### Step 6: Add Notification Service Monitor

1. Click **"+ Add New Monitor"**
2. Fill in:

```
Monitor Type: HTTP(s)
Friendly Name: Chat Notification
URL: https://chat-notification.onrender.com/health
Monitoring Interval: Every 5 minutes
Monitor Timeout: 30 seconds
```

3. Click **"Create Monitor"**

## ✅ You're Done!

Your dashboard should now show 5 monitors:
- ✅ Chat Gateway
- ✅ Chat Auth
- ✅ Chat User
- ✅ Chat Chat
- ✅ Chat Notification

Each will be pinged every 5 minutes, keeping your services awake!

## 📊 What You'll See

### Monitor Status:
- 🟢 **Green "Up"** = Service is online and responding
- 🔴 **Red "Down"** = Service is offline (you'll get email alert)
- 🟡 **Yellow "Paused"** = Monitor is paused

### Uptime Percentage:
- Shows uptime over last 24 hours, 7 days, 30 days
- Goal: 99%+ uptime

### Response Time:
- Shows how fast your services respond
- Typical: 200-500ms for Render free tier

## 🔔 Set Up Email Alerts (Optional but Recommended)

1. Click on your **profile icon** (top right)
2. Go to **"My Settings"**
3. Go to **"Alert Contacts"** tab
4. Your email is already added by default
5. You'll get emails when services go down!

### Alert Settings:
- **Down alerts**: Get notified when service goes down
- **Up alerts**: Get notified when service comes back up
- **Threshold**: Alert after 1 failed check (recommended)

## 📱 Mobile App (Optional)

UptimeRobot has mobile apps:
- **iOS**: Download from App Store
- **Android**: Download from Google Play

Get push notifications on your phone when services go down!

## 🎯 Expected Behavior

### Before UptimeRobot:
```
User tries to login → 502 Error (services sleeping)
Wait 60 seconds → Try again → Success
```

### After UptimeRobot:
```
User tries to login → Success immediately! ✅
No waiting, no 502 errors!
```

## 📈 Monitoring Dashboard

Your UptimeRobot dashboard will show:

```
┌─────────────────────────────────────────┐
│ Chat Gateway        🟢 Up    99.8%      │
│ Response: 245ms                         │
├─────────────────────────────────────────┤
│ Chat Auth          🟢 Up    99.9%      │
│ Response: 312ms                         │
├─────────────────────────────────────────┤
│ Chat User          🟢 Up    99.7%      │
│ Response: 289ms                         │
├─────────────────────────────────────────┤
│ Chat Chat          🟢 Up    99.8%      │
│ Response: 301ms                         │
├─────────────────────────────────────────┤
│ Chat Notification  🟢 Up    99.9%      │
│ Response: 267ms                         │
└─────────────────────────────────────────┘
```

## 🔧 Advanced Settings (Optional)

### Custom HTTP Headers:
If you want to add authentication headers:
1. Edit monitor
2. Go to "Advanced Settings"
3. Add custom headers

### Keyword Monitoring:
Check if response contains specific text:
1. Edit monitor
2. Enable "Keyword Exists"
3. Enter keyword: `healthy`

This ensures the service is not just responding, but responding correctly!

### SSL Certificate Monitoring:
UptimeRobot also checks SSL certificates:
- Alerts you before certificates expire
- Ensures HTTPS is working properly

## 💡 Pro Tips

### 1. Use Descriptive Names
Instead of "Service 1", use "Chat Gateway" so you know which service is down.

### 2. Set Up Status Page (Optional)
UptimeRobot can create a public status page:
- Share with users: `https://stats.uptimerobot.com/your-page`
- Shows real-time status of all services
- Professional and transparent

### 3. Group Monitors
Create monitor groups:
- "Backend Services" (Gateway, Auth, User, Chat, Notification)
- "Frontend" (if you add frontend monitoring)

### 4. Check Logs
View detailed logs:
- Click on any monitor
- See all up/down events
- Response times over time
- Downtime duration

### 5. Export Data
Export uptime data:
- CSV format
- Use for reports
- Track improvements

## 🆓 Free Tier Limits

UptimeRobot Free Plan includes:
- ✅ 50 monitors
- ✅ 5-minute intervals
- ✅ Email alerts
- ✅ 2-month log retention
- ✅ Public status pages
- ✅ SSL monitoring

**You're using 5 monitors, so you have 45 more available!**

## 🚨 Troubleshooting

### Monitor shows "Down" but service works:
- Increase timeout to 60 seconds
- Check if health endpoint is correct
- Verify service is actually responding

### Too many false alerts:
- Increase "Alert After" to 2-3 failed checks
- This prevents alerts for temporary glitches

### Service still sleeping:
- Verify monitors are active (not paused)
- Check interval is set to 5 minutes
- Wait 10 minutes for first ping cycle

## 📊 Alternative Services (If You Want Options)

### Other Free Monitoring Services:

1. **Cron-job.org**
   - Similar to UptimeRobot
   - 1-minute intervals
   - https://cron-job.org

2. **Freshping**
   - By Freshworks
   - 50 monitors free
   - https://www.freshworks.com/website-monitoring/

3. **StatusCake**
   - 10 monitors free
   - https://www.statuscake.com

**Recommendation: Stick with UptimeRobot - it's the most popular and reliable!**

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Created UptimeRobot account
- [ ] Added all 5 service monitors
- [ ] Set interval to 5 minutes
- [ ] Verified all monitors show "Up" (green)
- [ ] Email alerts are enabled
- [ ] Waited 10 minutes to confirm pings are working
- [ ] Tested app - no more 502 errors!
- [ ] Checked uptime percentages

## 🎉 Success!

Once all monitors are green and running:
- ✅ Your services will stay awake 24/7
- ✅ No more 502 errors for users
- ✅ You'll get alerts if anything goes down
- ✅ Professional monitoring for free!

## 📞 Your Services to Monitor

Here's a quick reference of all URLs to add:

```
1. Gateway:      https://chat-gateway-lfj7.onrender.com/health
2. Auth:         https://chat-auth.onrender.com/health
3. User:         https://chat-user.onrender.com/health
4. Chat:         https://chat-chat.onrender.com/health
5. Notification: https://chat-notification.onrender.com/health
```

Copy and paste these when creating monitors!

---

## 🚀 Quick Start Commands

If you prefer automation, here's a script to test all endpoints:

```bash
# Test all services
curl https://chat-gateway-lfj7.onrender.com/health
curl https://chat-auth.onrender.com/health
curl https://chat-user.onrender.com/health
curl https://chat-chat.onrender.com/health
curl https://chat-notification.onrender.com/health
```

All should return: `{"status":"healthy","service":"..."}`

---

**Now go set it up! It takes 5 minutes and solves the 502 error forever!** 🎉
