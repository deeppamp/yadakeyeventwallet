# YadaCoin & Salvium Hardware Wallet Setup Guide

## Overview

Dual cryptocurrency hardware wallet for ESP32-2432S028 (CYD - Cheap Yellow Display) supporting:
- **YadaCoin**: PRODUCTION READY with secure key rotation
- **Salvium**: TESTING ONLY (security limitations - see below)

## Hardware Requirements

- ESP32-2432S028 board (Sunton CYD)
- ILI9341 TFT display (320x240)
- XPT2046 touch controller
- USB cable for programming

## Quick Start

### 1. Install Dependencies

```powershell
# Install Node.js dependencies (web wallet)
cd yadakeyeventwallet
npm install

# Install PlatformIO for firmware (if needed)
pip install platformio
```

### 2. Start Web Wallet

```powershell
cd yadakeyeventwallet
npm run dev
```

Access at: `http://localhost:5173/wallet/`

### 3. Flash ESP32 Firmware

**Option A: Via Web (Recommended)**
1. Navigate to web wallet
2. Click "Flash Firmware" button
3. Select COM port
4. Wait for upload to complete

**Option B: Via PlatformIO**
```powershell
cd yadakeyeventwallet\public\salvium-firmware
python -m platformio run --target upload
```

## Project Structure

```
yadakeyeventwallet/
├── src/
│   ├── blockchains/
│   │   ├── YadaCoin.js          # YadaCoin wallet (SECURE)
│   │   └── Salvium.js           # Salvium wallet (TESTING ONLY)
│   ├── components/
│   │   └── Wallet2/             # Main wallet UI components
│   └── pages/
│       └── Wallet2.jsx          # Main wallet page
├── public/
│   └── salvium-firmware/
│       ├── src/
│       │   └── main.cpp         # ESP32 firmware (1140 lines)
│       ├── platformio.ini       # Build configuration
│       └── *.bin                # Pre-built firmware files
└── package.json
```

## Security Status

### ✅ YadaCoin - PRODUCTION READY

**Secure Features:**
- Pre-rotation key commitment system
- Blockchain validation of key continuity
- Forward security (previous keys can't be derived)
- QR codes expose only hashes of future keys

**QR Format:**
```
WIF|prerotatedKeyHash|twicePrerotatedKeyHash|prevPublicKeyHash|rotation
```

### ⚠️ Salvium - TESTING ONLY

**Current Limitations:**
- QR code exposes **RAW private spend key**
- No forward security protection
- No blockchain validation (Monero/CryptoNote architecture)
- Anyone who photographs/scans QR can steal ALL funds

**QR Format:**
```
privateSpendKey|rotation|sal
```

**Recommended Use:**
- Test amounts ONLY (<$10)
- Private environment only (no cameras)
- Never display QR in public

**Why Not Secure Like YadaCoin?**
- YadaCoin has custom blockchain with Key Event Log
- Salvium uses Monero protocol (no Key Event Log)
- Cannot copy YadaCoin's validation to different blockchain

**To Make Salvium Production-Ready (1-2 weeks):**
1. Implement HD wallet (BIP32) - export xpub only
2. Add view-key mode (Monero standard)
3. Hardware transaction signing
4. PIN protection before export
5. EEPROM encryption

## Firmware Features

- **Hardware RNG**: Uses ESP32 `esp_random()` for secure key generation
- **EEPROM Storage**: Persistent key storage with rotation counter
- **Dual Blockchain**: Switch between YadaCoin and Salvium
- **QR Export**: Display QR codes for wallet import
- **Rotation Increment**: [+] button to advance rotation counter

## Usage Flow

### Initial Setup

1. Power on ESP32 - generates secure keys using hardware RNG
2. Keys saved to EEPROM automatically
3. Select blockchain (YadaCoin or Salvium)

### Receive Funds

1. Tap "Receive" screen
2. QR code shows **public address only** (safe to share)
3. Copy address or scan QR

### Export Wallet (Import to Web)

1. Tap "Export" screen
2. **YadaCoin**: Safe to scan (hashes only)
3. **Salvium**: ⚠️ DANGER - exposes private key!
4. Scan QR with web wallet
5. Use [+] button to increment rotation before next export

### Key Rotation

1. Export wallet to web
2. Web wallet imports and validates
3. Increment rotation on hardware before next export
4. YadaCoin: Blockchain validates continuity
5. Salvium: No validation (testing only)

## Development

### Modify Firmware

```powershell
cd yadakeyeventwallet\public\salvium-firmware

# Edit source
code src\main.cpp

# Build and upload
python -m platformio run --target upload
```

### Modify Web Wallet

```powershell
cd yadakeyeventwallet

# Edit source
code src\blockchains\Salvium.js
code src\blockchains\YadaCoin.js

# Dev server auto-reloads
npm run dev
```

## Key Files for Review

### Security Implementation

- `src/blockchains/YadaCoin.js` (lines 637-1190)
  - Pre-rotation commitment system
  - Key continuity validation
  - Secure QR processing

- `src/blockchains/Salvium.js` (lines 854-875)
  - Security warnings
  - Raw key exposure (needs fixing)

### Firmware

- `public/salvium-firmware/src/main.cpp`
  - Lines 1095-1130: Hardware RNG key generation
  - Lines 1007-1092: EEPROM storage
  - Lines 470-478: Rotation increment
  - Lines 910-918: Security warnings

## Known Issues

1. **Salvium Security**: Raw private key exposure in QR code
2. **Salvium Rotation**: No blockchain validation
3. **No PIN Protection**: Keys accessible via physical access
4. **No EEPROM Encryption**: Keys stored in plaintext

## Recommended Improvements

### High Priority (Security)
1. Implement HD wallet for Salvium (xpub export)
2. Add PIN/password protection before export
3. Encrypt EEPROM storage
4. Add transaction signing on hardware

### Medium Priority (UX)
1. Add seed phrase backup/recovery
2. Multiple wallet slots
3. Transaction history on device
4. Balance display on hardware

### Low Priority (Features)
1. Bluetooth support
2. Battery operation
3. Additional blockchains
4. Hardware encryption chip

## Testing Checklist

### YadaCoin (Production)
- [x] Generate secure keys with hardware RNG
- [x] Display receive address
- [x] Export QR with pre-rotation hashes
- [x] Import to web wallet
- [x] Validate key continuity
- [x] Increment rotation counter
- [x] Persist keys across power cycle

### Salvium (Testing)
- [x] Generate secure keys with hardware RNG
- [x] Display receive address (CARROT SC1 format)
- [x] Export QR with raw private key
- [x] Display security warnings
- [x] Import to web wallet
- [x] Increment rotation counter
- [ ] HD wallet implementation (TODO)
- [ ] View-key mode (TODO)

## Contributing

When reviewing/modifying:

1. **Security Focus**: Any changes to key handling require security review
2. **Test Thoroughly**: Always test with small amounts first
3. **Document Changes**: Update this README with modifications
4. **Version Control**: Commit working states before major changes

## License

See LICENSE.md

## Support

- YadaCoin: Fully supported for production use
- Salvium: Testing only - use at own risk with <$10 amounts

## Version History

- v0.1.0-TESTING (Current)
  - Hardware RNG key generation
  - EEPROM persistent storage
  - Dual blockchain support
  - Security warnings for Salvium
  - YadaCoin production ready

## Contact

Repository: https://github.com/deeppamp/yadakeyeventwallet
