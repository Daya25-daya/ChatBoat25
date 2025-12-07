# 🐛 Debugging Messaging Issue

## Current Status

I've added console logging to help debug the messaging issue. Now when you send a message, you'll see logs in the browser console.

## How to Debug

### **Step 1: Open Browser Console**
1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Click on the "Console" tab

### **Step 2: Try Sending a Message**
1. Login with a user
2. Search for another user and select them
3. Type a message and click Send
4. Watch the console for these logs:
   - `Sending message: { receiverId, content, conversationId }`
   - `Received message_sent: { ... }`
   - Any errors

### **Step 3: Check What You See**

#### **If you see "Socket not connected":**
- The WebSocket connection failed
- Check if you see "Connected" in the header
- Try refreshing the page

#### **If you see "Sending message" but no "Received message_sent":**
- The message was sent but the server didn't respond
- Check gateway logs: `docker logs chat-gateway-service -f`
- The socket handler might have an issue

#### **If you see errors:**
- Copy the error message
- Check what it says

## Quick Fixes to Try

### **Fix 1: Refresh the Page**
Sometimes the WebSocket connection needs to be re-established:
1. Press `Ctrl+R` or `F5` to refresh
2. Login again
3. Try sending a message

### **Fix 2: Check Connection Status**
Look at the header - it should say "Connected" with a green dot:
- ✅ Green dot + "Connected" = Good
- ❌ Red dot + "Disconnected" = Problem

If disconnected:
1. Wait 5 seconds for auto-reconnect
2. If still disconnected, refresh the page

### **Fix 3: Restart Gateway Service**
```bash
docker restart chat-gateway-service
```
Wait 10 seconds, then refresh the browser.

### **Fix 4: Check All Services**
```bash
docker ps
```
Make sure all services show "Up" status.

## Common Issues & Solutions

### **Issue 1: Messages Don't Appear**
**Symptoms**: You send a message but it doesn't show up

**Check**:
1. Open browser console (F12)
2. Look for "Sending message" log
3. Look for "Received message_sent" log

**Solution**:
- If you see "Sending" but not "Received", the server isn't responding
- Check gateway logs: `docker logs chat-gateway-service --tail 50`
- Restart gateway: `docker restart chat-gateway-service`

### **Issue 2: Socket Not Connected**
**Symptoms**: Console shows "Socket not connected"

**Solution**:
1. Check if gateway service is running: `docker ps | findstr gateway`
2. Restart gateway: `docker restart chat-gateway-service`
3. Refresh browser
4. Check if header shows "Connected"

### **Issue 3: 403 Forbidden Errors**
**Symptoms**: API calls return 403 errors

**Solution**:
1. Your token expired
2. Logout and login again
3. Or refresh the page

### **Issue 4: Messages Send But Don't Show**
**Symptoms**: Console shows message sent successfully but UI doesn't update

**Check**:
1. Look for "Received message_sent" in console
2. Check if `activeConversation` is set

**Solution**:
- The message is being sent but not added to the UI
- This is a React state issue
- Refresh the page and try again

## Detailed Debugging Steps

### **1. Check WebSocket Connection**
In browser console, type:
```javascript
// This will be available in the console
console.log('Socket connected:', window.socket?.connected)
```

### **2. Monitor Gateway Logs**
In terminal:
```bash
docker logs chat-gateway-service -f
```
You should see:
- "User connected: [userId]" when you login
- Socket events when you send messages

### **3. Check Chat Service**
```bash
docker logs chat-chat-service --tail 20
```
Should show "Chat service running on port 4003"

### **4. Test Socket Manually**
In browser console:
```javascript
// Get the socket from the window (if exposed)
// Or check the Network tab for WebSocket connections
```

## What I Added

I've added console logging to:
1. **sendMessage function**: Logs when you try to send a message
2. **new_message event**: Logs when you receive a message from someone
3. **message_sent event**: Logs when your message is confirmed sent
4. **error event**: Logs any socket errors

## Next Steps

1. **Open the browser** (already opened)
2. **Open console** (F12)
3. **Login** with two users (use incognito for second user)
4. **Try sending a message**
5. **Watch the console** for logs
6. **Tell me what you see** in the console

## Expected Console Output

When everything works, you should see:
```
Sending message: { receiverId: "123...", content: "Hello", conversationId: null }
Received message_sent: { _id: "456...", content: "Hello", senderId: "789...", ... }
```

## If Nothing Works

Try this complete reset:
```bash
# Stop everything
docker-compose down

# Start everything fresh
docker-compose up -d

# Wait 30 seconds for services to initialize

# Check all services are running
docker ps

# Open browser
start http://localhost:3000
```

## Contact Points

If you see specific errors in the console, let me know:
1. The exact error message
2. When it happens (on send, on receive, etc.)
3. What the console logs show

I'll help you fix it based on what you see! 🔧
