# 🔧 Update Gateway Service URLs - Fix 502 Error

## The Problem Found!

Your gateway is configured with wrong service URLs:
- ❌ Gateway expects: `https://chat-auth.onrender.com`
- ✅ Actual URL is: `https://chat-auth-d6mj.onrender.com`

## ✅ Solution: Update Gateway Environment Variables

### Step 1: Go to Gateway Service
1. Open: https://dashboard.render.com
2. Click on: **chat-gateway-lfj7** (or chat-gateway)

### Step 2: Go to Environment Tab
1. Click **"Environment"** tab (left sidebar)
2. You'll see a list of environment variables

### Step 3: Update These 4 URLs

Find and update these variables:

#### AUTH_SERVICE_URL
- **Old value**: `https://chat-auth.onrender.com`
- **New value**: `https://chat-auth-d6mj.onrender.com`
- Click "Edit" → Paste new value → Click "Save Changes"

#### USER_SERVICE_URL
- **Old value**: `https://chat-user.onrender.com`
- **New value**: `https://chat-user-mk7j.onrender.com`
- Click "Edit" → Paste new value → Click "Save Changes"

#### CHAT_SERVICE_URL
- **Old value**: `https://chat-chat.onrender.com`
- **New value**: `https://chat-chat-tabm.onrender.com`
- Click "Edit" → Paste new value → Click "Save Changes"

#### NOTIFICATION_SERVICE_URL
- **Old value**: `https://chat-notification.onrender.com`
- **New value**: `https://chat-notification-f2su.onrender.com`
- Click "Edit" → Paste new value → Click "Save Changes"

### Step 4: Gateway Will Auto-Redeploy
- After saving changes, gateway will automatically redeploy
- Wait 3-5 minutes for redeployment
- Watch for "Live" status

### Step 5: Test Your App
1. Wait for gateway to show "Live"
2. Go to: https://chat-frontend-r61x.onrender.com
3. Try to login
4. Should work now! ✅

## 📋 Quick Copy-Paste Values

Copy these exact values when updating:

```
AUTH_SERVICE_URL
https://chat-auth-d6mj.onrender.com

USER_SERVICE_URL
https://chat-user-mk7j.onrender.com

CHAT_SERVICE_URL
https://chat-chat-tabm.onrender.com

NOTIFICATION_SERVICE_URL
https://chat-notification-f2su.onrender.com
```

## ⏱️ Timeline
- Update variables: 2 minutes
- Gateway redeploy: 3-5 minutes
- **Total: ~7 minutes**

## 🎉 After This Fix
- ✅ No more 502 errors
- ✅ Login works
- ✅ Messages work
- ✅ Calls work
- ✅ Everything works!

---

**Do this NOW and your app will work in 7 minutes!** 🚀
