@echo off
echo =======================================================
echo          STARTING PUBLIC BACKEND (LOCALTUNNEL)
echo =======================================================
echo.
echo Starting the local backend server...
start "Sports Backend" cmd /c "cd backend && npm run start"
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 >nul
echo.
echo Exposing backend to the internet...
echo IMPORTANT: Leave this window open to keep the backend running!
echo.
call npx -y localtunnel --port 5000 --subdomain sports-booking-api-99
pause
