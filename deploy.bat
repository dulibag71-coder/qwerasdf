@echo off
echo Starting Deployment...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
pause
