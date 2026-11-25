@echo off
rem 姓名：冀佳宁 | 学号：24002120625 |
rem 时间：2026-11-20 | 大模型：GLM
rem 启动后端服务（Node.js + Express，端口 8625）
chcp 65001 >nul
cd /d "%~dp0backend"
echo Starting server at http://localhost:8625 ...
node app.js
pause
