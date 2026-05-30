@echo off
REM Quick launcher for JMeter performance test
REM Usage: run-test.bat [threads] [rampup] [loops]

setlocal

REM Default values
set THREADS=200
set RAMPUP=30
set LOOPS=5
set HOST=localhost
set PORT=3000

REM Override with command line arguments if provided
if not "%1"=="" set THREADS=%1
if not "%2"=="" set RAMPUP=%2
if not "%3"=="" set LOOPS=%3

echo ========================================
echo PreERP Performance Test Runner
echo ========================================
echo Configuration:
echo   Threads (Users): %THREADS%
echo   Ramp-up Time: %RAMPUP%s
echo   Loop Count: %LOOPS%
echo   Target: http://%HOST%:%PORT%
echo ========================================
echo.

REM Check if JMeter is available
where jmeter >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: JMeter not found in PATH
    echo Please install Apache JMeter and add it to your PATH
    echo Download from: https://jmeter.apache.org/download_jmeter.cgi
    pause
    exit /b 1
)

REM Create results directory if it doesn't exist
if not exist "results" mkdir results

REM Generate timestamp for unique result files
for /f "tokens=2 delims==" %%I in ('wscript /nologo "%~dp0get-timestamp.vbs" 2^>nul') do set datetime=%%I
if "%datetime%"=="" set datetime=%date:~-4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set datetime=%datetime: =0%

set RESULT_DIR=results\test-%datetime%
set RESULT_JTL=%RESULT_DIR%\results.jtl
set RESULT_LOG=%RESULT_DIR%\jmeter.log

echo Creating result directory: %RESULT_DIR%
mkdir "%RESULT_DIR%"

echo.
echo Starting JMeter test in command-line mode...
echo Results will be saved to: %RESULT_DIR%
echo.

REM Run JMeter in non-GUI mode
jmeter -n -t performance-test.jmx ^
    -l "%RESULT_JTL%" ^
    -j "%RESULT_LOG%" ^
    -e -o "%RESULT_DIR%\html-report" ^
    -JHOST=%HOST% ^
    -JPORT=%PORT% ^
    -Jthreads=%THREADS% ^
    -Jrampup=%RAMPUP% ^
    -Jloops=%LOOPS%

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Test completed successfully!
    echo ========================================
    echo.
    echo Results saved to: %RESULT_DIR%
    echo HTML Report: %RESULT_DIR%\html-report\index.html
    echo.
    echo Opening HTML report in browser...
    start "" "%RESULT_DIR%\html-report\index.html"
) else (
    echo.
    echo ========================================
    echo Test failed with error code: %errorlevel%
    echo ========================================
    echo Check the log file: %RESULT_LOG%
)

echo.
pause
