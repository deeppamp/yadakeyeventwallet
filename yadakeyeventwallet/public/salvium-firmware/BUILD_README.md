# Salvium Hardware Wallet Firmware

ESP32-based secure hardware wallet for Salvium cryptocurrency.

## Features

✅ **Implemented**:
- Secure key generation using ESP32 hardware RNG
- Private spend key and view key storage in encrypted flash
- Salvium address generation (simplified format)
- Serial command interface (INIT, INFO, ADDR, SEED, RESET)
- Improv Serial protocol for ESP Web Tools compatibility
- JSON output for web interface integration
- Persistent storage using ESP32 NVS (Non-Volatile Storage)

⚠️ **Demo Implementation Notes**:
- Uses SHA-256 for view key derivation (production Salvium uses Keccak-256)
- Address encoding is simplified hex format (production uses Base58 with network byte)
- Full CryptoNote transaction signing not yet implemented

## Building

### Prerequisites

Install PlatformIO CLI:
```bash
# Via Python pip
pip install platformio

# Or via Homebrew (macOS)
brew install platformio

# Or use VS Code with PlatformIO extension
```

### Build Firmware

```powershell
# Run build script (Windows)
cd public/salvium-firmware
.\build.ps1

# Or build manually
pio run
```

This will:
1. Compile the firmware
2. Generate binaries (bootloader, partitions, firmware)
3. Calculate checksums
4. Update manifest.json for web flashing

### Flash to Device

**Option 1: Web Flasher** (Recommended)
1. Start dev server: `npm run dev`
2. Navigate to wallet in browser
3. Select "Salvium" blockchain
4. Click "Flash to Device" button
5. Select your ESP32 serial port

**Option 2: PlatformIO**
```bash
pio run --target upload
```

**Option 3: Manual**
```bash
esptool.py --chip esp32 --port COM3 write_flash 0x1000 bootloader.bin 0x8000 partitions.bin 0xe000 boot_app0.bin 0x10000 firmware.bin
```

## Hardware Requirements

**Minimum**:
- ESP32 development board (ESP32-WROOM-32, ESP32-DevKitC, etc.)
- USB cable for programming
- Serial monitor (Arduino IDE, PlatformIO, or web serial)

**Optional** (for full wallet experience):
- SSD1306 OLED display (128x64)
- Physical buttons (confirm, cancel, navigation)
- Secure enclosure

## Usage

### Serial Commands

Connect to the device at 115200 baud and send commands:

```
INIT  - Initialize new wallet (generates keys)
INFO  - Display wallet information
ADDR  - Show Salvium address
SEED  - Export private keys (⚠️ SENSITIVE!)
RESET - Clear all wallet data
```

### Example Session

```
> INIT
=== Initializing Wallet ===
✓ Wallet saved to secure storage
✓ Wallet initialized successfully!

=== Salvium Wallet Info ===
Address: Sal3f8a9c... (48 chars)
Status: Active
Storage: ESP32 Secure Flash
=========================

> ADDR
=== Salvium Address ===
Sal3f8a9c2b7e1d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8
=====================
```

## Project Structure

```
salvium-firmware/
├── platformio.ini          # PlatformIO configuration
├── src/
│   └── main.cpp           # Main firmware code
├── binaries/              # Generated binaries (after build)
│   ├── bootloader.bin
│   ├── partitions.bin
│   ├── boot_app0.bin
│   └── firmware.bin
├── manifest.json          # ESP Web Tools manifest
├── build.ps1             # Build script
└── README.md             # This file
```

## Security Considerations

- Keys are stored in ESP32 NVS (encrypted when flash encryption is enabled)
- Hardware RNG used for key generation (`esp_fill_random`)
- Private keys never transmitted over serial unless explicitly exported
- SEED command should be disabled in production builds
- Consider enabling ESP32 flash encryption for production

## Future Enhancements

- Full CryptoNote address encoding (Base58 with network byte)
- Keccak-256 hashing for view key derivation
- Ed25519 public key computation
- Transaction parsing and signing
- Ring signature generation
- OLED display integration
- Physical button interface
- BIP39 mnemonic seed support
- Multi-signature support
- Hardware wallet communication protocol (USB HID)

## License

See parent project LICENSE.md
