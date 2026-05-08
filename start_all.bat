@echo off
echo =======================================================
echo          STARTING SPORTS BOOKING LOCALLY
echo =======================================================
echo.
echo Starting the Backend Server...
start "Sports Backend" cmd /c "cd backend && npm run dev"
echo Waiting 5 seconds for backend to start...
timeout /t 5 >nul
echo.
echo Starting the Frontend Server...
start "Sports Frontend" cmd /k "cd frontend && call npx -y kill-port 5173 && call npm run dev"
echo.
echo =======================================================
echo DONE! Opening the link for you now...
echo =======================================================
timeout /t 5 >nul
start http://localhost:5173
exit
