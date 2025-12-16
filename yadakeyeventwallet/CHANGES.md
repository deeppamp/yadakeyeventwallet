# Salvium Firmware Changes - Production Ready

## Overview
Upgraded Salvium hardware wallet from demo mode to production-ready with secure random key generation and persistent storage.

---

## 🔐 Security Upgrade: Demo → Production

### Key Generation

**BEFORE (Demo Mode)**:
```cpp
// Predictable, insecure demo keys
const char* privateKeySeed = "Salvium-Demo-Private-Spend-Key";
sha256.reset();
sha256.update((uint8_t*)privateKeySeed, strlen(privateKeySeed));
sha256.finalize(hash, 32);
```
- Used SHA256 hash of fixed string
- **Security**: ❌ Predictable, anyone with code can recreate keys
- **Suitable for**: Demo/testing only

**AFTER (Production Mode)**:
```cpp
// Cryptographically secure random generation
esp_fill_random(randomBytes, 32);
salviumPrivateSpendKey = "";
for (int i = 0; i < 32; i++) {
  char hex[3];
  sprintf(hex, "%02x", randomBytes[i]);
  salviumPrivateSpendKey += hex;
}
```
- Uses ESP32 hardware random number generator
- **Security**: ✅ Cryptographically secure, unpredictable
- **Suitable for**: Real testing and small amounts

---

## 💾 Persistent Storage

### EEPROM Integration

**NEW**: Added EEPROM persistent storage
```cpp
#define EEPROM_SIZE 512
#define EEPROM_MAGIC 0xCA57
#define EEPROM_ADDR_MAGIC 0
#define EEPROM_ADDR_YDA_KEY 2
#define EEPROM_ADDR_SAL_KEY 66
#define EEPROM_ADDR_SAL_ROT 130
```

**Storage Layout**:
```
Offset | Size | Content
-------|------|------------------
0      | 2    | Magic number (0xCA57)
2      | 64   | YadaCoin key
66     | 64   | Salvium private key
130    | 4    | Rotation counter
```

### Save Function
```cpp
void saveKeysToEEPROM() {
  EEPROM.writeUShort(EEPROM_ADDR_MAGIC, EEPROM_MAGIC);
  // Save YadaCoin address (64 hex chars)
  // Save Salvium private key (64 hex chars)
  // Save rotation counter
  EEPROM.commit();
}
```

### Load Function
```cpp
bool loadKeysFromEEPROM() {
  uint16_t magic = EEPROM.readUShort(EEPROM_ADDR_MAGIC);
  if (magic != EEPROM_MAGIC) return false;
  
  // Load keys from EEPROM
  // Generate Salvium address from private key
  return true;
}
```

---

## 🔄 Boot Sequence Changes

### Old Flow
```
setup()
  ├── Initialize display
  ├── Initialize touch
  ├── generateDemoAddresses()  ← Always regenerates
  └── Show splash screen
```

### New Flow
```
setup()
  ├── Initialize display
  ├── Initialize touch
  ├── EEPROM.begin()
  ├── if (!loadKeysFromEEPROM())
  │    └── generateSecureWallets()  ← Only on first boot
  └── Show splash screen
```

**Result**: Keys persist across reboots instead of regenerating each time.

---

## 🔢 Rotation Counter Persistence

### Old Behavior
```cpp
// Increment but don't save
salviumRotation++;
drawSalviumExportScreen();
```
- Rotation reset to 0 on every boot

### New Behavior
```cpp
// Increment AND save to EEPROM
salviumRotation++;
EEPROM.writeInt(EEPROM_ADDR_SAL_ROT, salviumRotation);
EEPROM.commit();
Serial.println("[EEPROM] Rotation saved");
drawSalviumExportScreen();
```
- Rotation survives power cycles

---

## 📝 Code Changes Summary

### Files Modified
- `main.cpp` - All changes in firmware

### New Includes
```cpp
#include <EEPROM.h>
#include <esp_system.h>
```

### New Functions Added
1. `saveKeysToEEPROM()` - Save wallet data to persistent storage
2. `loadKeysFromEEPROM()` - Load wallet data on boot
3. `generateSecureWallets()` - Generate production keys with hardware RNG

### Functions Removed
1. `generateDemoAddresses()` - Replaced with `generateSecureWallets()`

### Modified Code Sections
1. **Setup function**: Added EEPROM initialization and key loading
2. **Touch handler**: Added EEPROM save when rotation increments
3. **Export screen**: Changed warning text from "DEMO MODE" to "WARNING: Private key visible!"

---

## 🔍 Serial Output Comparison

### Demo Mode (Old)
```
[WALLET] Generating demo wallets...
[OK] Demo wallets generated
YadaCoin: YDAe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b...
Salvium: SC1eMaMaMaMa... (predictable pattern)
Salvium Key: 5994471abb01112afcc18159f6cc74b4f511b99806da59b...
```

### Production Mode (New)

**First Boot**:
```
[EEPROM] No valid keys found (magic mismatch)
[WALLET] No existing keys - generating new secure wallet
[WALLET] Generating PRODUCTION wallets...
[SECURITY] Using ESP32 hardware RNG (esp_random)
[OK] PRODUCTION wallets generated
YadaCoin: YDAa7f3b9d2e8c1f4... (truly random)
Salvium: SC1x4n8m2p9q... (truly random)
Salvium Key: d8a9c7b4e2f1a0b9... (truly random)
[SECURITY] Keys are cryptographically secure and persistent
[EEPROM] Keys saved to EEPROM
```

**Subsequent Boots**:
```
[EEPROM] Loading keys...
[OK] Keys loaded from EEPROM
YadaCoin: YDAa7f3b9d2e8c1f4... (same as before)
Salvium: SC1x4n8m2p9q... (same as before)
Rotation: 3 (persisted value)
```

---

## 📊 Memory Impact

### Before
```
RAM:   22,476 bytes (6.9%)
Flash: 345,465 bytes (26.4%)
```

### After
```
RAM:   22,508 bytes (6.9%) ← +32 bytes
Flash: 355,757 bytes (27.1%) ← +10,292 bytes
```

**Increase**: ~10 KB flash for EEPROM library and new functions
**Worth it**: YES - adds persistent storage and secure RNG

---

## 🧪 Testing Differences

### Demo Mode Testing
- ✅ QR codes work
- ✅ Addresses display correctly
- ✅ Web wallet import works
- ❌ Keys change every boot
- ❌ Not suitable for real funds

### Production Mode Testing
- ✅ QR codes work
- ✅ Addresses display correctly
- ✅ Web wallet import works
- ✅ Keys persist across boots
- ✅ Rotation counter persists
- ✅ Suitable for test amounts

---

## ⚠️ Important Notes

### What This Changes
1. **Key generation**: Now uses hardware RNG instead of SHA256
2. **Persistence**: Keys stored in EEPROM and survive reboots
3. **Rotation**: Counter persists across power cycles
4. **Security**: Keys are cryptographically secure

### What This Doesn't Change
1. **QR format**: Still `privateKey|rotation|sal` for export
2. **Address format**: Still SC1 CARROT (95 characters)
3. **Receive QR**: Still just the address (like YadaCoin)
4. **UI/UX**: All screens and navigation remain the same
5. **Web wallet**: No changes needed, already compatible

### Limitations Still Present
1. **No seed phrase**: Can't restore on different device
2. **No PIN**: Physical access = full access
3. **No encryption**: EEPROM stores keys in cleartext
4. **No backup**: If EEPROM corrupts, keys are lost

---

## 🚀 Deployment

### Uploading New Firmware
```bash
cd public/salvium-firmware
python -m platformio run --target upload
```

**IMPORTANT**: Uploading new firmware may clear EEPROM!
- Export wallet before updating
- Write down private key from serial monitor
- Consider keys lost after firmware update

### First Boot After Upload
```
[EEPROM] No valid keys found (magic mismatch)
[WALLET] Generating new secure wallet
```
- Normal behavior on first boot
- New random keys will be generated
- Keys will be saved and persist for future boots

---

## 📚 References

### ESP32 Random Functions
- `esp_random()` - 32-bit hardware random number
- `esp_fill_random()` - Fill buffer with random bytes
- Source: ESP32 hardware RNG peripheral

### EEPROM API
- `EEPROM.begin(size)` - Initialize with size
- `EEPROM.write(addr, value)` - Write byte
- `EEPROM.read(addr)` - Read byte
- `EEPROM.writeInt/readInt` - Integer operations
- `EEPROM.writeUShort/readUShort` - Unsigned short
- `EEPROM.commit()` - Save changes to flash

---

## ✅ Verification

After uploading firmware, verify:
1. Serial monitor shows "Using ESP32 hardware RNG"
2. Keys are saved to EEPROM on first boot
3. Rotation increments show "[EEPROM] Rotation saved"
4. Power cycle loads keys instead of regenerating
5. Rotation counter persists across reboots

---

**✨ Salvium wallet is now production-ready with secure keys and persistent storage!**
