@echo off
echo =======================================================
echo          SPORTS BOOKING DEPLOYMENT SCRIPT
echo =======================================================
echo.
echo Step 1: Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error during build!
    pause
    exit /b %errorlevel%
)
echo.
echo Step 2: Deploying to Firebase...
call npx firebase deploy
if %errorlevel% neq 0 (
    echo Error during deployment!
    pause
    exit /b %errorlevel%
)
echo.
echo =======================================================
echo SUCCESS! Your public frontend URL is: 
echo https://sports-booking-61a76.web.app
echo =======================================================
echo (Note: Any backend changes must be pushed to GitHub to update on Render)
pause
