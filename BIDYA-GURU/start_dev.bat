@echo off
echo Starting Bidya Guru Backend & Frontend...
start cmd /k "cd /d %~dp0backend && npm run dev"
start cmd /k "cd /d %~dp0frontend && npm run dev"
echo Both services launched! 
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000

