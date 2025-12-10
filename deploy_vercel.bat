@echo off
title Golf Club Vercel Deployment
echo ===================================================
echo       Golf Club AI Platform - Vercel Deploy
echo ===================================================
echo.
echo [1] Authenticating with Vercel...
echo     (If a browser opens, please log in)
call vercel login
echo.
echo [2] deploy...
echo     (Press Enter for all questions)
call vercel
echo.
echo ===================================================
echo       Deployment Process Finished
echo ===================================================
pause
