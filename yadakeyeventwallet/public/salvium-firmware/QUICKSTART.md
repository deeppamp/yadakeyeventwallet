# Quick Start Guide - Salvium Hardware Wallet

## Testing Without Building

Since PlatformIO isn't installed, you have two options:

### Option 1: Install PlatformIO (Recommended)

**Via Python (if Python installed):**
```powershell
pip install platformio
```

**Via VS Code:**
1. Install VS Code extension: PlatformIO IDE
2. Open `salvium-firmware` folder in VS Code
3. Click "Build" button in PlatformIO toolbar

**Then build:**
```powershell
cd c:\Users\smuck\Downloads\yadakeyeventwallet-1\yadakeyeventwallet\public\salvium-firmware
pio run
```

### Option 2: Use Arduino IDE

1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board support:
   - File → Preferences
   - Add to "Additional Board Manager URLs": `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install

3. Install libraries:
   - Tools → Manage Libraries
   - Install: `ArduinoJson`, `Crypto`

4. Open `src/main.cpp` in Arduino IDE
5. Select board: Tools → Board → ESP32 Arduino → ESP32 Dev Module
6. Connect ESP32 and select port: Tools → Port
7. Click Upload button

### Option 3: Pre-compiled Binaries

I can create minimal test binaries. However, for actual ESP32 firmware, we need to compile with the proper toolchain. The firmware I created requires compilation.

## What to Do Next

**Easiest path:**
```powershell
# Install PlatformIO CLI
pip install platformio

# Navigate to firmware directory
cd c:\Users\smuck\Downloads\yadakeyeventwallet-1\yadakeyeventwallet\public\salvium-firmware

# Build firmware
pio run

# Binaries will be in .pio/build/esp32dev/
```

Then run the build script to copy binaries and update manifest:
```powershell
.\build.ps1
```

## Testing the Web Flasher

Once you have binaries:

1. Start dev server (if not running):
   ```powershell
   npm run dev
   ```

2. Navigate to http://localhost:5173/wallet/

3. Select "Salvium" blockchain

4. Click "Flash to Device" button

5. Connect your ESP32 via USB and select the port

6. The flasher will upload the firmware

7. Open serial monitor at 115200 baud

8. Send command: `INIT`

9. You should see wallet initialization and address generation!

## Firmware Features

Once flashed, you can use these serial commands:

- `INIT` - Generate new wallet keys
- `INFO` - Display wallet info and address
- `ADDR` - Show address only
- `SEED` - Export private keys (be careful!)
- `RESET` - Erase wallet data

The firmware uses ESP32 hardware RNG for secure key generation and stores keys in encrypted NVS flash memory.
