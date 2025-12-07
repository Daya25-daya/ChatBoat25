# ✅ UptimeRobot Setup Checklist

## 🎯 Goal
Set up free monitoring to keep your services awake 24/7 and eliminate 502 errors.

## 📋 Quick Setup (Choose One Method)

### Method 1: Manual Setup (5 Minutes) ⭐ RECOMMENDED

**Step 1: Create Account**
- [ ] Go to https://uptimerobot.com
- [ ] Click "Sign Up Free"
- [ ] Enter email and password
- [ ] Verify email
- [ ] Login to dashboard

**Step 2: Add Monitors (Do this 5 times, once for each service)**

For each service below, click "+ Add New Monitor" and fill in:

#### Monitor 1: Gateway Service
- [ ] Monitor Type: `HTTP(s)`
- [ ] Friendly Name: `Chat Gateway`
- [ ] URL: `https://chat-gateway-lfj7.onrender.com/health`
- [ ] Monitoring Interval: `Every 5 minutes`
- [ ] Click "Create Monitor"

#### Monitor 2: Auth Service
- [ ] Monitor Type: `HTTP(s)`
- [ ] Friendly Name: `Chat Auth`
- [ ] URL: `https://chat-auth.onrender.com/health`
- [ ] Monitoring Interval: `Every 5 minutes`
- [ ] Click "Create Monitor"

#### Monitor 3: User Service
- [ ] Monitor Type: `HTTP(s)`
- [ ] Friendly Name: `Chat User`
- [ ] URL: `https://chat-user.onrender.com/health`
- [ ] Monitoring Interval: `Every 5 minutes`
- [ ] Click "Create Monitor"

#### Monitor 4: Chat Service
- [ ] Monitor Type: `HTTP(s)`
- [ ] Friendly Name: `Chat Chat`
- [ ] URL: `https://chat-chat.onrender.com/health`
- [ ] Monitoring Interval: `Every 5 minutes`
- [ ] Click "Create Monitor"

#### Monitor 5: Notification Service
- [ ] Monitor Type: `HTTP(s)`
- [ ] Friendly Name: `Chat Notification`
- [ ] URL: `https://chat-notification.onrender.com/health`
- [ ] Monitoring Interval: `Every 5 minutes`
- [ ] Click "Create Monitor"

**Step 3: Verify**
- [ ] All 5 monitors show green "Up" status
- [ ] Email alerts are enabled (check My Settings)
- [ ] Wait 10 minutes and check monitors are still pinging

---

### Method 2: Automated Setup (2 Minutes)

**Step 1: Get API Key**
- [ ] Go to https://uptimerobot.com/dashboard#mySettings
- [ ] Scroll to "API Settings"
- [ ] Click "Show/hide it" to reveal Main API Key
- [ ] Copy the API key

**Step 2: Run Script**
```bash
node setup-monitoring.js YOUR_API_KEY
```

- [ ] Script creates all 5 monitors automatically
- [ ] Check dashboard to verify all monitors are created

---

## 🎉 Success Indicators

After setup, you should see:

- [ ] ✅ 5 monitors in your UptimeRobot dashboard
- [ ] 🟢 All monitors showing "Up" status
- [ ] 📧 Email alerts enabled
- [ ] 📊 Uptime percentages showing 100%
- [ ] ⏱️ Response times showing (200-500ms typical)

## 🧪 Test It Works

**Before UptimeRobot:**
- [ ] Try to login after 20 minutes of inactivity
- [ ] Get 502 error
- [ ] Wait 60 seconds
- [ ] Try again - works

**After UptimeRobot:**
- [ ] Wait 20 minutes
- [ ] Try to login
- [ ] Works immediately! ✅
- [ ] No 502 errors!

## 📱 Optional: Mobile App

- [ ] Download UptimeRobot app (iOS/Android)
- [ ] Login with your account
- [ ] Enable push notifications
- [ ] Get alerts on your phone

## 🔔 Optional: Alert Settings

- [ ] Go to My Settings → Alert Contacts
- [ ] Verify email is added
- [ ] Set alert threshold (1 failed check recommended)
- [ ] Enable "Down" alerts
- [ ] Enable "Up" alerts

## 📊 Optional: Status Page

Create a public status page:
- [ ] Go to Status Pages
- [ ] Click "Add New Status Page"
- [ ] Select all 5 monitors
- [ ] Customize design
- [ ] Get public URL
- [ ] Share with users

## 🎯 Final Verification

Test everything works:

**Day 1:**
- [ ] All monitors created
- [ ] All showing green
- [ ] No 502 errors when using app

**Day 2:**
- [ ] Check uptime percentages (should be 99%+)
- [ ] Verify services stayed awake
- [ ] No 502 errors

**Day 7:**
- [ ] Check weekly uptime report
- [ ] Verify consistent uptime
- [ ] Happy users! 🎉

## 📞 Your Service URLs (Quick Reference)

Copy these when creating monitors:

```
1. https://chat-gateway-lfj7.onrender.com/health
2. https://chat-auth.onrender.com/health
3. https://chat-user.onrender.com/health
4. https://chat-chat.onrender.com/health
5. https://chat-notification.onrender.com/health
```

## 🚨 Troubleshooting

### Monitor shows "Down"
- [ ] Check if URL is correct
- [ ] Verify service is running on Render
- [ ] Check service logs for errors
- [ ] Increase timeout to 60 seconds

### Still getting 502 errors
- [ ] Verify monitors are active (not paused)
- [ ] Check interval is 5 minutes
- [ ] Wait 10 minutes for first ping cycle
- [ ] Verify all 5 monitors are created

### Not receiving alerts
- [ ] Check email spam folder
- [ ] Verify email in Alert Contacts
- [ ] Check alert settings are enabled
- [ ] Test by pausing a monitor

## 💰 Cost

**UptimeRobot Free Plan:**
- ✅ $0/month
- ✅ 50 monitors (you're using 5)
- ✅ 5-minute intervals
- ✅ Email alerts
- ✅ Forever free!

**No credit card required!**

## 📚 Documentation

- Full guide: `UPTIMEROBOT_SETUP.md`
- Render guide: `RENDER_FREE_TIER_GUIDE.md`
- 502 error fix: `FIX_502_ERROR.md`

## ⏱️ Time Estimate

- Manual setup: 5 minutes
- Automated setup: 2 minutes
- Verification: 10 minutes
- **Total: 15 minutes to solve 502 errors forever!**

---

## 🎉 You're Done!

Once all checkboxes are checked:
- ✅ Services stay awake 24/7
- ✅ No more 502 errors
- ✅ Email alerts if anything goes down
- ✅ Professional monitoring
- ✅ Happy users!

**Now go set it up! Start here: https://uptimerobot.com** 🚀
