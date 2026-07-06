@echo off
setlocal
chcp 65001 >nul

set "PROJECT_ROOT=%~dp0"
set "PYTHON=%PROJECT_ROOT%.venv\Scripts\python.exe"

echo.
echo ==========================================
echo Reliability Report Tool - EXE Builder
echo ==========================================
echo.

if not exist "%PYTHON%" (
    echo [Error] Python virtual environment was not found:
    echo %PYTHON%
    echo Create .venv and install backend requirements first.
    pause
    exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
    echo [Error] npm.cmd was not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [1/4] Checking frontend dependencies...
if not exist "%PROJECT_ROOT%frontend\node_modules" (
    echo node_modules was not found. Running npm install...
    pushd "%PROJECT_ROOT%frontend"
    call npm.cmd install
    if errorlevel 1 (
        popd
        echo [Error] npm install failed.
        pause
        exit /b 1
    )
    popd
)

echo [2/4] Building frontend...
pushd "%PROJECT_ROOT%frontend"
call npm.cmd run build
if errorlevel 1 (
    popd
    echo [Error] Frontend build failed.
    pause
    exit /b 1
)
popd

echo [3/4] Checking PyInstaller...
"%PYTHON%" -m PyInstaller --version >nul 2>nul
if errorlevel 1 (
    echo PyInstaller was not found. Installing it into .venv...
    "%PYTHON%" -m pip install pyinstaller
    if errorlevel 1 (
        echo [Error] PyInstaller installation failed.
        pause
        exit /b 1
    )
)

echo [4/4] Building executable package...
pushd "%PROJECT_ROOT%"
"%PYTHON%" -m PyInstaller --noconfirm ReliabilityReportTool.spec
if errorlevel 1 (
    popd
    echo [Error] PyInstaller build failed.
    pause
    exit /b 1
)
popd

echo.
echo ==========================================
echo Build completed.
echo Output:
echo %PROJECT_ROOT%dist\ReliabilityReportTool\ReliabilityReportTool.exe
echo.
echo User data will be stored beside the executable in:
echo %PROJECT_ROOT%dist\ReliabilityReportTool\data
echo ==========================================
echo.
pause
