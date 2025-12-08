@echo off
echo Testing all services...
echo.

echo Testing Gateway...
curl https://chat-gateway-lfj7.onrender.com/health
echo.
echo.

echo Testing Auth...
curl https://chat-auth.onrender.com/health
echo.
echo.

echo Testing User...
curl https://chat-user.onrender.com/health
echo.
echo.

echo Testing Chat...
curl https://chat-chat.onrender.com/health
echo.
echo.

echo Testing Notification...
curl https://chat-notification.onrender.com/health
echo.
echo.

echo All tests complete!
pause
