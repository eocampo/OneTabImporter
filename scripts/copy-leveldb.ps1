<#
.SYNOPSIS
    Safely copy OneTab LevelDB files for processing

.DESCRIPTION
    Copies the OneTab extension's LevelDB storage to a working directory
    for safe processing. The browser must be closed before running this script.

.PARAMETER Browser
    Browser to copy from: 'edge' (default) or 'chrome'

.PARAMETER ExtensionId
    Custom extension ID (optional, uses defaults for known browsers)

.PARAMETER Profile
    Browser profile folder name (default: 'Default')

.PARAMETER OutputPath
    Destination folder for the copy (default: './leveldb-copy')

.EXAMPLE
    .\copy-leveldb.ps1
    
.EXAMPLE
    .\copy-leveldb.ps1 -Browser chrome
    
.EXAMPLE
    .\copy-leveldb.ps1 -Browser edge -Profile "Profile 1"
#>

param(
    [ValidateSet('edge', 'chrome')]
    [string]$Browser = 'edge',
    
    [string]$ExtensionId = '',
    
    [string]$Profile = 'Default',
    
    [string]$OutputPath = './leveldb-copy'
)

# Default extension IDs
$ExtensionIds = @{
    'edge' = 'hoimpamkkoehapgenciaoajfkfkpgfop'
    'chrome' = 'chphlpgkkbolifaimnlloiipkdnihall'
}

# Browser data paths
$BrowserPaths = @{
    'edge' = Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data'
    'chrome' = Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data'
}

# Resolve extension ID
if (-not $ExtensionId) {
    $ExtensionId = $ExtensionIds[$Browser]
}

# Build source path
$BrowserDataPath = $BrowserPaths[$Browser]
$SourcePath = Join-Path -Path $BrowserDataPath -ChildPath $Profile
$SourcePath = Join-Path -Path $SourcePath -ChildPath 'Local Extension Settings'
$SourcePath = Join-Path -Path $SourcePath -ChildPath $ExtensionId

Write-Host ""
Write-Host "OneTab LevelDB Copy Script" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Browser:      $Browser" -ForegroundColor Gray
Write-Host "Extension ID: $ExtensionId" -ForegroundColor Gray
Write-Host "Profile:      $Profile" -ForegroundColor Gray
Write-Host "Source:       $SourcePath" -ForegroundColor Gray
Write-Host "Destination:  $OutputPath" -ForegroundColor Gray
Write-Host ""

# Check if source exists
if (-not (Test-Path $SourcePath)) {
    Write-Host "ERROR: Source path not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  - OneTab extension is not installed in $Browser"
    Write-Host "  - Wrong browser profile (try -Profile 'Profile 1')"
    Write-Host "  - Extension uses a different storage location"
    Write-Host ""
    Write-Host "Available profiles:" -ForegroundColor Yellow
    Get-ChildItem $BrowserDataPath -Directory | Where-Object { $_.Name -like 'Default' -or $_.Name -like 'Profile *' } | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor Gray
    }
    exit 1
}

# Check if browser is running
$BrowserProcesses = @{
    'edge' = 'msedge'
    'chrome' = 'chrome'
}

$ProcessName = $BrowserProcesses[$Browser]
$RunningProcesses = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue

if ($RunningProcesses) {
    Write-Host "WARNING: $Browser appears to be running!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "LevelDB files may be locked or in an inconsistent state." -ForegroundColor Yellow
    Write-Host "For best results, close all $Browser windows first." -ForegroundColor Yellow
    Write-Host ""
    
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Aborted." -ForegroundColor Gray
        exit 0
    }
}

# Create output directory
$OutputPath = [System.IO.Path]::GetFullPath($OutputPath)

if (Test-Path $OutputPath) {
    Write-Host "Removing existing copy at $OutputPath..." -ForegroundColor Gray
    Remove-Item -Path $OutputPath -Recurse -Force
}

# Copy the files
Write-Host "Copying LevelDB files..." -ForegroundColor Cyan

try {
    Copy-Item -Path $SourcePath -Destination $OutputPath -Recurse -Force
    
    # Verify copy
    $SourceFiles = Get-ChildItem $SourcePath -File
    $DestFiles = Get-ChildItem $OutputPath -File
    
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copied $($DestFiles.Count) files to: $OutputPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Files copied:" -ForegroundColor Gray
    $DestFiles | ForEach-Object {
        $Size = if ($_.Length -gt 1MB) { "{0:N2} MB" -f ($_.Length / 1MB) }
                elseif ($_.Length -gt 1KB) { "{0:N2} KB" -f ($_.Length / 1KB) }
                else { "$($_.Length) bytes" }
        Write-Host ("  {0,-30} {1,10}" -f $_.Name, $Size) -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Next step: Run the import command" -ForegroundColor Cyan
    Write-Host "  npm run start -- import --leveldb `"$OutputPath`"" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "ERROR: Failed to copy files!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
