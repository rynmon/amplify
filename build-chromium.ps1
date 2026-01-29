# Build script for Chromium extension
# This script copies Chromium-specific files and shared files into dist/chromium/
# Updates manifest.json paths and creates a ZIP file

Write-Host "Building Chromium extension..." -ForegroundColor Green

# Clean and create dist directory
$distDir = "dist\chromium"
if (Test-Path $distDir) {
    Remove-Item $distDir -Recurse -Force
}
New-Item -ItemType Directory -Path $distDir -Force | Out-Null

Write-Host "Copying Chromium-specific files..." -ForegroundColor Yellow
# Copy Chromium-specific files
Copy-Item "src\chromium\*.js" -Destination $distDir
Copy-Item "src\chromium\manifest.json" -Destination $distDir

Write-Host "Copying shared files..." -ForegroundColor Yellow
# Copy shared files
Copy-Item "src\shared\popup.html" -Destination $distDir
Copy-Item "src\shared\popup.css" -Destination $distDir
Copy-Item "src\shared\popup.js" -Destination $distDir
Copy-Item "src\shared\icons" -Destination $distDir -Recurse

Write-Host "Updating manifest.json paths..." -ForegroundColor Yellow
# Read manifest.json
$manifestPath = Join-Path $distDir "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

# Update paths in manifest.json (remove ../shared/ references)
$manifest.action.default_popup = "popup.html"
$manifest.action.default_icon."16" = "icons/icon16.png"
$manifest.action.default_icon."48" = "icons/icon48.png"
$manifest.action.default_icon."128" = "icons/icon128.png"
$manifest.icons."16" = "icons/icon16.png"
$manifest.icons."48" = "icons/icon48.png"
$manifest.icons."128" = "icons/icon128.png"

# Save updated manifest.json
$manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath

Write-Host "Creating ZIP file..." -ForegroundColor Yellow
# Create ZIP file
$zipPath = "dist\amplify-chromium.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Create ZIP using .NET compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($distDir, $zipPath)

Write-Host "Chromium extension built successfully!" -ForegroundColor Green
Write-Host "  Output: $distDir" -ForegroundColor Cyan
Write-Host "  ZIP: $zipPath" -ForegroundColor Cyan
