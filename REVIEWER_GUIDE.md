# Reviewer Quick Start Guide

## TL;DR for Discord Review

**What Works:**
- ✅ YadaCoin: Production-ready, secure key rotation with blockchain validation
- ⚠️ Salvium: Functional but INSECURE (exposes private keys) - needs HD wallet implementation

**What to Review:**
1. Security model differences between YadaCoin and Salvium
2. Whether HD wallet implementation for Salvium is feasible
3. Code quality and best practices

## Quick Clone & Test

```powershell
# Clone
git clone https://github.com/deeppamp/yadakeyeventwallet.git
cd yadakeyeventwallet/yadakeyeventwallet

# Install & run
npm install
npm run dev
```

Access: http://localhost:5173/wallet/

## Key Questions for Review

### 1. Can Salvium Use YadaCoin's Security Model?

**Current Answer: NO**

**Reason:**
- YadaCoin has custom blockchain with "Key Event Log" feature
- Salvium uses Monero/CryptoNote protocol (no Key Event Log)
- YadaCoin validates key rotation commitments on-chain
- Salvium has no mechanism to store/validate rotations

**See:**
- `src/blockchains/YadaCoin.js` lines 1157-1190 (validateKeyContinuity)
- `src/blockchains/Salvium.js` lines 854-875 (raw key exposure)

### 2. What's the Best Fix for Salvium?

**Options:**

**A) HD Wallet (BIP32)** - Recommended
```javascript
// Export master public key only
const xpub = deriveExtendedPublicKey(masterSeed);
const qr = `${xpub}|${rotation}|sal`;
// Cannot derive private keys from xpub
```

**B) View-Key Mode** - Monero Standard
```javascript
// Export view key only (can see balance, cannot spend)
const qr = `${privateViewKey}|${rotation}|sal`;
// Hardware signs transactions
```

**C) Subaddress System** - Native Salvium
```javascript
// Use Monero's subaddress feature
const subaddressIndex = rotation;
const qr = `${masterPublicKey}|${subaddressIndex}|sal`;
```

**Effort Estimate:** 1-2 weeks for HD wallet

### 3. Is the Firmware Code Quality Good?

**Review:**
- `public/salvium-firmware/src/main.cpp` (1140 lines)
- Hardware RNG usage (lines 1095-1130)
- EEPROM storage (lines 1007-1092)
- Display/touch handling

**Look for:**
- Memory leaks
- Buffer overflows
- Proper error handling
- Code organization

## Critical Security Issues

### Issue #1: Salvium Raw Private Key Exposure

**Location:** `public/salvium-firmware/src/main.cpp` line ~600

```cpp
// INSECURE - exposes raw private key
String qrData = salviumPrivateSpendKey + "|" + salviumRotation + "|sal";
```

**Impact:** Anyone who scans/photographs QR can steal all funds immediately

**Fix:** Implement HD wallet or view-key mode

### Issue #2: No PIN Protection

**Location:** Firmware has no authentication

**Impact:** Physical access = full key access

**Fix:** Add PIN entry before displaying export QR

### Issue #3: Unencrypted EEPROM

**Location:** `main.cpp` lines 1007-1092

```cpp
void saveKeysToEEPROM() {
  // Keys stored in plaintext
  EEPROM.writeString(EEPROM_ADDR_YDA_KEY, yadacoinAddress);
  EEPROM.writeString(EEPROM_ADDR_SAL_KEY, salviumPrivateSpendKey);
}
```

**Impact:** Physical access to chip = key extraction

**Fix:** Encrypt EEPROM contents with device-specific key

## Code Quality Review Points

### Good Practices Found

1. **Hardware RNG**: Uses ESP32's `esp_random()` instead of pseudo-random
2. **Persistent Storage**: Keys survive power cycles
3. **Security Warnings**: Clear warnings about Salvium limitations
4. **Modular Design**: Separate blockchain implementations

### Areas for Improvement

1. **Error Handling**: Limited error checking in firmware
2. **Magic Numbers**: Some hardcoded values could be constants
3. **Code Duplication**: YadaCoin/Salvium screens share code
4. **Comments**: Firmware could use more inline documentation
5. **Testing**: No automated tests

## Performance Notes

**Firmware Size:**
- Flash: 356KB / 1310KB (27.2%)
- RAM: 22.5KB / 327KB (6.9%)
- Plenty of room for HD wallet implementation

**Build Time:** ~15 seconds
**Upload Time:** ~3 seconds

## Testing Instructions

### Test YadaCoin (Safe)

1. Flash firmware
2. Select YadaCoin
3. Scan receive QR (address only) - SAFE
4. Scan export QR - SAFE (contains hashes, not keys)
5. Import to web wallet
6. Verify address matches
7. Test with small amount ($5)

### Test Salvium (UNSAFE - Use <$10 Only)

1. Flash firmware
2. Select Salvium
3. Scan receive QR (address only) - SAFE
4. **DO NOT scan export QR in public** - EXPOSES PRIVATE KEY
5. Import to web wallet in private environment
6. Test with tiny amount (<$10)

## Questions to Answer

1. **Architecture**: Is separating YadaCoin security from Salvium the right approach?
2. **HD Wallet**: Should we implement BIP32 for Salvium? (1-2 weeks)
3. **View-Key**: Or use Monero's view-key model instead?
4. **PIN Protection**: Worth adding or rely on physical security?
5. **EEPROM Encryption**: Priority level for this feature?
6. **Code Quality**: Any major refactoring needed?
7. **Additional Blockchains**: Worth expanding beyond YadaCoin/Salvium?

## Files Needing Most Attention

### High Priority
1. `src/blockchains/Salvium.js` - Security model
2. `public/salvium-firmware/src/main.cpp` - Key generation/storage
3. `SECURITY_ANALYSIS.md` - Threat assessment

### Medium Priority
4. `src/blockchains/YadaCoin.js` - Validation logic
5. `src/components/Wallet2/` - UI components
6. `platformio.ini` - Build configuration

### Low Priority
7. Build/deploy scripts
8. Documentation
9. UI polish

## Recommended Review Order

1. Read `SECURITY_ANALYSIS.md` (understanding the problem)
2. Review `src/blockchains/YadaCoin.js` (secure reference implementation)
3. Review `src/blockchains/Salvium.js` (insecure implementation)
4. Review `public/salvium-firmware/src/main.cpp` (firmware)
5. Test with hardware (if available)
6. Provide feedback on approach

## Contact for Questions

- GitHub Issues: https://github.com/deeppamp/yadakeyeventwallet/issues
- Discord: [Your Discord handle]

## Expected Review Time

- Quick scan: 30 minutes
- Thorough code review: 2-3 hours
- Full testing with hardware: 1-2 hours

## Most Valuable Feedback

1. HD wallet implementation approach for Salvium
2. Security vulnerabilities in current code
3. Code quality improvements
4. Alternative solutions to the Salvium security problem
