# Golf Club AI Platform - Automated Deployment Script
$ErrorActionPreference = "Stop"

Write-Host "⛳ Golf Club AI Platform Deployment Starting..." -ForegroundColor Green

# 0. Define Fly Path explicitly
$flyDir = "$env:USERPROFILE\.fly\bin"
$flyExe = "$flyDir\fly.exe"

# 1. Install Fly.io CLI
if (-not (Test-Path $flyExe)) {
    Write-Host "`n[1/6] Installing Fly.io CLI..."
    iwr https://fly.io/install.ps1 -useb | iex
} else {
    Write-Host "`n[1/6] Fly.io CLI already installed."
}

# Verify again
if (-not (Test-Path $flyExe)) {
    Write-Host "Error: Fly CLI installation failed." -ForegroundColor Red
    Pause
    exit
}

# 2. Login
Write-Host "`n[2/6] Authenticating..."
Write-Host "A browser window will open. Please log in to Fly.io." -ForegroundColor Yellow
& $flyExe auth login

# 3. Launch App
Write-Host "`n[3/6] Initializing App Configuration..."
if (-not (Test-Path "fly.toml")) {
    & $flyExe launch --no-deploy
} else {
    Write-Host "fly.toml detected, skipping launch init."
}

# 4. Create Volume (Project Data)
Write-Host "`n[4/6] Checking Persistent Storage (Volume)..."
$tomlContent = Get-Content fly.toml -Raw
if ($tomlContent -match 'app = "(.*?)"') {
    $appName = $matches[1]
    Write-Host "App Name detected: $appName"
    
    # Check if volume exists (rough check, or just try verify)
    & $flyExe volumes create golf_data --size 1 --app $appName --region nrt --no-encryption --yes
}

# 5. Configure Mounts
Write-Host "`n[5/6] Configuring Storage Mounts..."
$tomlContent = Get-Content fly.toml -Raw
if ($tomlContent -notlike "*[mounts]*") {
    Add-Content -Path fly.toml -Value "`n[mounts]`n  source = `"golf_data`"`n  destination = `"/data`""
    Write-Host "fly.toml updated with volume configuration."
}

# 6. Deploy
Write-Host "`n[6/6] Deploying to Server..."
& $flyExe deploy

Write-Host "`n✅ Deployment Complete! Enjoy your Golf App." -ForegroundColor Green
Pause
