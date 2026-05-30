# PreERP JMeter Performance Test Runner (PowerShell)
# Usage: .\run-test.ps1 [-Threads 200] [-RampUp 30] [-Loops 5] [-Host localhost] [-Port 3000]

param(
    [int]$Threads = 200,
    [int]$RampUp = 30,
    [int]$Loops = 5,
    [string]$Host = "localhost",
    [int]$Port = 3000
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PreERP Performance Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration:"
Write-Host "  Threads (Users): $Threads"
Write-Host "  Ramp-up Time: ${RampUp}s"
Write-Host "  Loop Count: $Loops"
Write-Host "  Target: http://${Host}:${Port}"
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if JMeter is available
$jmeterPath = Get-Command jmeter -ErrorAction SilentlyContinue
if (-not $jmeterPath) {
    Write-Host "ERROR: JMeter not found in PATH" -ForegroundColor Red
    Write-Host "Please install Apache JMeter and add it to your PATH"
    Write-Host "Download from: https://jmeter.apache.org/download_jmeter.cgi"
    Read-Host "Press Enter to exit"
    exit 1
}

# Create results directory
if (-not (Test-Path "results")) {
    New-Item -ItemType Directory -Path "results" | Out-Null
}

# Generate timestamp for unique result files
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$resultDir = "results\test-$timestamp"
$resultJtl = "$resultDir\results.jtl"
$resultLog = "$resultDir\jmeter.log"
$htmlReport = "$resultDir\html-report"

Write-Host "Creating result directory: $resultDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $resultDir | Out-Null

Write-Host "`nStarting JMeter test in command-line mode..."
Write-Host "Results will be saved to: $resultDir`n" -ForegroundColor Yellow

# Run JMeter
$jmeterArgs = @(
    "-n",
    "-t", "performance-test.jmx",
    "-l", $resultJtl,
    "-j", $resultLog,
    "-e",
    "-o", $htmlReport,
    "-JHOST=$Host",
    "-JPORT=$Port",
    "-Jthreads=$Threads",
    "-Jrampup=$RampUp",
    "-Jloops=$Loops"
)

$process = Start-Process -FilePath "jmeter" -ArgumentList $jmeterArgs -NoNewWindow -Wait -PassThru

if ($process.ExitCode -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Test completed successfully!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Results saved to: $resultDir"
    Write-Host "HTML Report: $htmlReport\index.html`n"
    
    Write-Host "Opening HTML report in browser..." -ForegroundColor Yellow
    Start-Process "$htmlReport\index.html"
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "Test failed with error code: $($process.ExitCode)" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    Write-Host "Check the log file: $resultLog" -ForegroundColor Yellow
}

Read-Host "`nPress Enter to exit"
