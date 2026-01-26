@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo    可靠性测试报告自动化工具一键启动脚本
echo ==========================================
echo.

REM 设置工作目录
set PROJECT_ROOT=%~dp0
set BACKEND_DIR=%PROJECT_ROOT%backend
set FRONTEND_DIR=%PROJECT_ROOT%frontend

echo 项目根目录: %PROJECT_ROOT%
echo.

REM 检查Python虚拟环境
echo [1/4] 检查Python虚拟环境...
if not exist "%PROJECT_ROOT%.venv\Scripts\python.exe" (
    echo 错误: 未找到Python虚拟环境，请先创建虚拟环境
    pause
    exit /b 1
)
echo ✓ Python虚拟环境存在
echo.

REM 检查Node.js环境
echo [2/4] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)
echo ✓ Node.js环境正常
echo.

REM 启动后端服务
echo [3/4] 启动后端服务 (Flask)...
start "Reliability Test Report Backend" cmd /c "cd /d %BACKEND_DIR% && ..\.venv\Scripts\python.exe app.py"

REM 等待后端启动
timeout /t 5 /nobreak >nul

REM 启动前端服务
echo [4/4] 启动前端服务 (Vue.js)...
start "Reliability Test Report Frontend" cmd /c "cd /d %FRONTEND_DIR% && npm run dev && pause"

echo.
echo ==========================================
echo 服务启动完成！
echo.
echo 后端地址: http://127.0.0.1:5000
echo 前端地址: http://localhost:3000
echo.
echo 请在浏览器中访问: http://localhost:3000
echo ==========================================

pause