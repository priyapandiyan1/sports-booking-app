@echo off
cd frontend
echo Killing port 5173 just in case it is already in use...
call npx -y kill-port 5173
echo Starting the frontend server...
call npm install
call npm run dev
pause
