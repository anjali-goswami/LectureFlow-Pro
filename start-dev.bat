@echo off
title LectureFlow Pro - Full Stack Dev Runner
echo ========================================================
echo Starting LectureFlow Pro (Server on :5003, Client on :3000)...
echo ========================================================
echo.

cd /d "%~dp0"
npm run dev
pause
