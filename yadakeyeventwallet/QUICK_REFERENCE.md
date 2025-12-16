# Salvium Hardware Wallet - Quick Reference

## 🎯 Quick Start

### Device Info
- **Hardware**: ESP32-2432S028 (320x240 TFT + Touch)
- **Firmware**: v0.1.0 Production
- **Security**: ESP32 Hardware RNG + EEPROM
- **Web Wallet**: http://localhost:5174/wallet/

---

## 📱 Navigation

```
MAIN MENU
├── YadaCoin
│   ├── Receive (QR: address only)
│   └── Send (connect to web)
├── Salvium
│   ├── Receive (QR: SC1 address, 95 chars)
│   ├── Send (connect to web)
│   └── Export (QR: privateKey|rotation|sal)
└── Settings
```

---

## 🔑 QR Code Formats

### Receive (Like YadaCoin)
```
SC1a452bc824a72a5fa93ef8aad2f4...
```
- **Purpose**: Share address to receive payments
- **Length**: 95 characters
- **Format**: Just the address

### Export (For Web Wallet)
```
f4e3d2c1b0a998877665544332211|0|sal
```
- **Purpose**: Import wallet to web interface
- **Format**: `privateSpendKey|rotation|blockchain`
- **Parts**:
  - Private key: 64 hex chars
  - Rotation: integer counter
  - Blockchain: "sal"

---

## 🎮 Controls

| Action | Method |
|--------|--------|
| **Navigate Menu** | Touch screen or BOOT button |
| **Select Item** | Touch button or BOOT on selection |
| **Increment Rotation** | Touch **[+] Next Key** on export screen |
| **Return** | Touch back arrow or anywhere on screen |

---

## 🔐 Security Features

✅ **Active**:
- Hardware RNG (esp_random)
- EEPROM persistent storage
- Rotation counter persistence
- Cryptographically secure keys

⚠️ **Not Implemented**:
- Seed phrase backup
- PIN/password protection
- Encrypted storage
- Multi-wallet support

---

## 🧪 Testing Checklist

- [ ] Power on ESP32, check serial output
- [ ] Navigate to Salvium → Receive
- [ ] Scan QR code, verify SC1 address (95 chars)
- [ ] Navigate to Salvium → Export
- [ ] Touch [+] Next Key button
- [ ] Verify rotation increments (0→1→2...)
- [ ] Scan export QR with web wallet
- [ ] Verify wallet imports successfully
- [ ] Check send/receive options appear in web UI
- [ ] Power cycle ESP32
- [ ] Verify rotation counter persists

---

## 📊 Serial Monitor Commands

### Normal Boot Messages
```
[OK] Display initialized
[OK] EEPROM initialized
[EEPROM] Loading keys...
YadaCoin: YDAa1b2c3d4e5f...
Salvium: SC1x9y8z7w6v5u...
Rotation: 0
```

### Rotation Increment
```
[SALVIUM] Rotation incremented to 1
[EEPROM] Rotation saved
```

### First Boot (New Keys)
```
[EEPROM] No valid keys found (magic mismatch)
[WALLET] Generating PRODUCTION wallets...
[SECURITY] Using ESP32 hardware RNG
[OK] PRODUCTION wallets generated
[EEPROM] Keys saved to EEPROM
```

---

## 🌐 Web Wallet Integration

1. **Start Server**: Already running on port 5174
2. **Open Browser**: http://localhost:5174/wallet/
3. **Select Blockchain**: Choose "Salvium"
4. **Import Wallet**: 
   - Click "Rotate Key" or import button
   - Allow camera access
   - Scan export QR from ESP32
5. **Verify**: Address should match ESP32 display

---

## 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| Keys regenerate on boot | EEPROM not initialized - check serial |
| Rotation doesn't persist | Check `[EEPROM] Rotation saved` message |
| QR won't scan | Hold camera 6-8" away, good lighting |
| Web wallet no send/receive | Reload page after import |
| Port 5173 in use | Server auto-switched to 5174 |

---

## 📈 Firmware Size

```
RAM:    22,508 bytes (6.9% of 320 KB)
Flash: 355,757 bytes (27.1% of 1.3 MB)
```

---

## 💡 Tips

1. **Back up your keys**: Write down the private key from serial monitor
2. **Test rotation**: Try different rotation values before using
3. **Verify addresses**: Compare ESP32 display with web wallet
4. **Serial logging**: Keep serial monitor open during testing
5. **Power cycles**: Test persistence by unplugging/replugging

---

## 🚀 Ready to Test!

1. Check ESP32 serial output shows secure key generation
2. Navigate through all Salvium screens
3. Test rotation increment button
4. Import to web wallet and verify
5. Power cycle and verify persistence

**Web wallet**: http://localhost:5174/wallet/
