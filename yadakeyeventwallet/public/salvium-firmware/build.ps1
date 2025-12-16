# Salvium Hardware Wallet - Build Script
# Compiles ESP32 firmware using PlatformIO and prepares binaries for web flashing

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Salvium Hardware Wallet Builder" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if PlatformIO is installed
$pioVersion = pio --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PlatformIO CLI not found!" -ForegroundColor Red
    Write-Host "Install PlatformIO: https://platformio.org/install/cli" -ForegroundColor Yellow
    Write-Host "Or use VS Code with PlatformIO extension" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ PlatformIO detected: $pioVersion" -ForegroundColor Green

# Get firmware directory
$firmwareDir = $PSScriptRoot
Write-Host "Firmware directory: $firmwareDir" -ForegroundColor Cyan

# Clean previous builds
Write-Host "`nCleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "$firmwareDir\.pio") {
    Remove-Item -Recurse -Force "$firmwareDir\.pio\build"
}

# Build firmware
Write-Host "`nBuilding firmware..." -ForegroundColor Yellow
Set-Location $firmwareDir
pio run

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✓ Build successful!" -ForegroundColor Green

# Copy binaries to public directory
$buildDir = "$firmwareDir\.pio\build\esp32dev"
$binariesDir = "$firmwareDir\binaries"

Write-Host "`nPreparing binaries for web flasher..." -ForegroundColor Yellow

# Create binaries directory
if (-not (Test-Path $binariesDir)) {
    New-Item -ItemType Directory -Path $binariesDir | Out-Null
}

# Copy bootloader
if (Test-Path "$buildDir\bootloader.bin") {
    Copy-Item "$buildDir\bootloader.bin" "$binariesDir\bootloader.bin"
    Write-Host "✓ Copied bootloader.bin" -ForegroundColor Green
}

# Copy partitions
if (Test-Path "$buildDir\partitions.bin") {
    Copy-Item "$buildDir\partitions.bin" "$binariesDir\partitions.bin"
    Write-Host "✓ Copied partitions.bin" -ForegroundColor Green
}

# Copy boot_app
if (Test-Path "$buildDir\boot_app0.bin") {
    Copy-Item "$buildDir\boot_app0.bin" "$binariesDir\boot_app0.bin"
    Write-Host "✓ Copied boot_app0.bin" -ForegroundColor Green
}

# Copy firmware
if (Test-Path "$buildDir\firmware.bin") {
    Copy-Item "$buildDir\firmware.bin" "$binariesDir\firmware.bin"
    Write-Host "✓ Copied firmware.bin" -ForegroundColor Green
} else {
    Write-Host "⚠ firmware.bin not found, trying alternative names..." -ForegroundColor Yellow
    $fwBin = Get-ChildItem "$buildDir\*.bin" | Where-Object { $_.Name -match "firmware" } | Select-Object -First 1
    if ($fwBin) {
        Copy-Item $fwBin.FullName "$binariesDir\firmware.bin"
        Write-Host "✓ Copied $($fwBin.Name) as firmware.bin" -ForegroundColor Green
    }
}

# Calculate file sizes and checksums
Write-Host "`nGenerating checksums..." -ForegroundColor Yellow

function Get-FileSHA256 {
    param([string]$filePath)
    $hash = Get-FileHash -Path $filePath -Algorithm SHA256
    return $hash.Hash.ToLower()
}

$binaries = @(
    @{name="bootloader.bin"; offset="0x1000"},
    @{name="partitions.bin"; offset="0x8000"},
    @{name="boot_app0.bin"; offset="0xe000"},
    @{name="firmware.bin"; offset="0x10000"}
)

$manifestParts = @()

foreach ($bin in $binaries) {
    $path = "$binariesDir\$($bin.name)"
    if (Test-Path $path) {
        $size = (Get-Item $path).Length
        $checksum = Get-FileSHA256 $path
        Write-Host "  $($bin.name): $size bytes (SHA256: $($checksum.Substring(0,16))...)" -ForegroundColor Cyan
        
        $manifestParts += @"
    {
      "path": "salvium-firmware/binaries/$($bin.name)",
      "offset": $($bin.offset)
    }
"@
    }
}

# Update manifest.json
Write-Host "`nUpdating manifest.json..." -ForegroundColor Yellow

$manifestContent = @"
{
  "name": "Salvium Hardware Wallet",
  "version": "1.0.0",
  "home_assistant_domain": "esphome",
  "new_install_prompt_erase": true,
  "builds": [
    {
      "chipFamily": "ESP32",
      "parts": [
$($manifestParts -join ",`n")
      ]
    }
  ]
}
"@

Set-Content -Path "$firmwareDir\manifest.json" -Value $manifestContent
Write-Host "✓ manifest.json updated" -ForegroundColor Green

# Display summary
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Binaries location: $binariesDir" -ForegroundColor Yellow
Write-Host "Manifest: $firmwareDir\manifest.json" -ForegroundColor Yellow
Write-Host "`nTo flash via web:" -ForegroundColor Cyan
Write-Host "1. Start dev server: npm run dev" -ForegroundColor White
Write-Host "2. Navigate to wallet" -ForegroundColor White
Write-Host "3. Select Salvium blockchain" -ForegroundColor White
Write-Host "4. Click 'Flash to Device' button" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan
