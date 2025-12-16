# Security Analysis: Salvium vs YadaCoin Key Rotation

## ⚠️ CRITICAL SECURITY ISSUE IDENTIFIED

### Current Salvium Implementation: **INSECURE**

**Problem**: The Salvium QR code exposes the raw private spend key without any forward security protection.

**Current QR Format**:
```
privateSpendKey|rotation|sal
```

**Security Flaw**:
- ❌ Anyone who scans the QR code gets the ACTUAL private spend key
- ❌ No pre-rotation commitment (can't prove you control future keys)
- ❌ If attacker scans QR, they can steal all funds immediately
- ❌ Not following YadaCoin's proven secure rotation model

---

## ✅ YadaCoin Security Model (Correct Approach)

### How YadaCoin Protects Against QR Scanning Attacks

**YadaCoin QR Format**:
```
WIF|prerotatedKeyHash|twicePrerotatedKeyHash|prevPublicKeyHash|rotation
```

**Security Features**:
1. **Forward Security**: Current key commits to hashes of future keys
   - `prerotatedKeyHash` = SHA256 hash of next rotation's public key
   - `twicePrerotatedKeyHash` = SHA256 hash of rotation after next

2. **Key Continuity Validation**: Blockchain enforces:
   ```javascript
   validateKeyContinuity(newKey, fetchedLog) {
     const lastEntry = fetchedLog[fetchedLog.length - 1];
     // Verify newKey's hash matches lastEntry.prerotatedKeyHash
     // Verify newKey's prerotation matches lastEntry.twicePrerotatedKeyHash
   }
   ```

3. **Theft Protection**:
   - Attacker scans rotation N QR
   - Attacker tries to spend funds
   - **Blockchain rejects**: No prerotation commitment for N+1
   - Owner with rotation N+1 and N+2 (already committed) can spend first
   - Attacker is always one step behind

**Example Attack Scenario**:
```
Time T0: User shows rotation 5 QR
Time T1: Attacker scans it, gets rotation 5 private key
Time T2: Attacker tries to spend funds
Time T3: Blockchain checks: "Does rotation 5 commit to rotation 6?"
         - YES: rotation 5 committed hash(rotation 6) on blockchain
Time T4: Blockchain checks: "Is this spend signed by committed rotation 6?"
         - NO: Attacker only has rotation 5
         - REJECT transaction
Time T5: Owner signs with rotation 6 (which they already generated)
         - ACCEPT transaction
```

---

## 🔐 Recommended Fix for Salvium

### Option 1: Hierarchical Deterministic (HD) Wallet Model

**Use BIP32 HD derivation** (like Bitcoin HD wallets):

1. **Master Seed** (never exposed):
   ```
   User has 12/24-word seed phrase
   Master private key derived from seed
   ```

2. **Rotation Keys Derived**:
   ```
   Rotation 0: m/44'/0'/0'/0/0
   Rotation 1: m/44'/0'/0'/0/1
   Rotation 2: m/44'/0'/0'/0/2
   ...
   ```

3. **QR Code Contains**:
   ```
   xpub (extended public key)|rotation|sal
   ```
   - `xpub` allows deriving public keys for ALL rotations
   - Private keys stay on hardware device
   - **Cannot derive private keys from xpub** (BIP32 security property)

4. **Security Properties**:
   - ✅ Scanning QR gives ONLY public key information
   - ✅ Cannot derive private keys from public keys
   - ✅ Hardware wallet holds master seed securely
   - ✅ Each rotation is deterministic and recoverable from seed

**Implementation**:
```javascript
// ESP32 Firmware (secure element)
const masterSeed = generateSecureRandom(32); // 256-bit seed
const derivePath = `m/44'/0'/0'/0/${rotation}`;
const childKey = deriveKey(masterSeed, derivePath);

// QR format: xpub|rotation|sal
const qr = `${xpub}|${rotation}|sal`;

// Web Wallet
const xpub = parseQR();
const publicKey = derivePublicKey(xpub, rotation);
// Can generate addresses but NOT spend
```

### Option 2: CryptoNote Subaddress Model

**Use Salvium's native subaddress system**:

1. **Master Keys** (stay on hardware):
   ```
   Private spend key (a)
   Private view key (b)
   ```

2. **Subaddress Generation** (deterministic):
   ```
   For rotation i:
   D_i = H_s("SubAddr\0" || a || i) * G + B
   C_i = a * D_i
   ```
   Where:
   - `H_s` = Hash-to-scalar function
   - `G` = Base point
   - `B` = Public spend key
   - `D_i` = Subaddress public spend key
   - `C_i` = Subaddress public view key

3. **QR Code Contains**:
   ```
   viewKey|rotation|sal
   ```
   - `viewKey` allows VIEWING transactions (not spending)
   - Spend key stays on hardware
   - Web wallet can monitor balances

4. **Security Properties**:
   - ✅ View key cannot be used to spend
   - ✅ Hardware wallet signs transactions
   - ✅ Web wallet displays balance and history
   - ✅ Standard CryptoNote security model

**Implementation**:
```javascript
// ESP32 Firmware
const privateSpendKey = generateSecureRandom(32);
const privateViewKey = deriveViewKey(privateSpendKey);
const rotation = currentRotation;

// QR format: viewKey|rotation|sal (or: subaddressIndex|rotation|sal)
const qr = `${privateViewKey}|${rotation}|sal`;

// Web Wallet
const viewKey = parseQR();
const subaddressIndex = rotation;
// Can view transactions, cannot spend
// Must request hardware wallet to sign spends
```

---

## 🚨 Current Risk Assessment

### Salvium Current Implementation

**Risk Level**: **CRITICAL - DO NOT USE WITH REAL FUNDS**

**Vulnerabilities**:
1. **QR Exposure**: Anyone who sees the QR gets full private key
2. **No Forward Security**: No protection against key compromise
3. **No Key Continuity**: Cannot prove ownership of future rotations
4. **Single Point of Failure**: One QR scan = total fund loss

**Attack Vectors**:
- 📹 Security camera captures QR code
- 📱 Someone photographs your screen
- 🎥 Screen sharing leak
- 👀 Shoulder surfing
- 🖥️ Malware screenshot capture

**Result**: **Immediate and complete loss of all funds**

---

## ✅ Recommended Immediate Actions

### 1. **WARNING LABELS** (Immediate)
Add prominent warnings to firmware and web wallet:
```
⚠️ CRITICAL SECURITY WARNING ⚠️
Export QR contains UNPROTECTED private key!
Anyone who scans this QR can steal ALL your funds.
NEVER show this QR in public, on camera, or to anyone.
This is for TESTING ONLY with small amounts.
```

### 2. **Implement HD Wallet** (Short-term)
- Use BIP32/BIP44 hierarchical deterministic derivation
- Export only xpub (extended public key)
- Keep private keys on hardware device
- Timeline: 1-2 weeks development

### 3. **Implement View-Only Mode** (Medium-term)
- Export private view key only (CryptoNote standard)
- Web wallet can view balances, not spend
- Hardware wallet signs all transactions
- Timeline: 2-4 weeks development

### 4. **Add PIN Protection** (Medium-term)
- Require PIN before showing export QR
- Lock device after timeout
- Encrypt EEPROM with PIN-derived key
- Timeline: 1-2 weeks development

### 5. **Security Audit** (Long-term)
- Professional cryptographic review
- Penetration testing
- Side-channel analysis
- Timeline: 4-8 weeks

---

## 📋 Comparison Matrix

| Feature | YadaCoin | Salvium (Current) | Salvium (HD Wallet) | Salvium (View-Key) |
|---------|----------|-------------------|---------------------|-------------------|
| **QR Exposes Private Key** | ❌ No | ✅ YES | ❌ No | ❌ No |
| **Forward Security** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **QR Scanning Safe** | ✅ Yes | ❌ **NO** | ✅ Yes | ✅ Yes |
| **Key Continuity** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Seed Recovery** | ✅ Yes | ❌ No | ✅ Yes | ⚠️ Partial |
| **Hardware RNG** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **EEPROM Persistent** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Production Ready** | ✅ Yes | ❌ **NO** | ✅ Yes | ✅ Yes |

---

## 🎯 Conclusion

**Current Status**: Salvium implementation is **NOT SECURE** for production use.

**Critical Issue**: QR code exposes raw private spend key with no protection.

**Required Fix**: Implement HD wallet (BIP32) or view-only key model.

**Current Use Case**: Demo and testing with **SMALL AMOUNTS ONLY** (<$10).

**Do NOT use**: For any significant funds until HD wallet is implemented.

---

## 📝 References

1. **YadaCoin Security Model**:
   - Pre-rotation commitment system
   - Key continuity validation
   - Forward security through hash chaining

2. **BIP32 Hierarchical Deterministic Wallets**:
   - https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
   - Extended public keys (xpub) for address generation
   - Cannot derive private keys from xpub

3. **CryptoNote Subaddresses**:
   - Monero/Salvium standard subaddress derivation
   - View keys for balance monitoring
   - Spend keys remain on hardware

4. **Hardware Wallet Security**:
   - Secure element isolation
   - PIN protection
   - Transaction signing on device
   - Never export private keys

---

**Status**: This analysis was completed on December 15, 2025.
**Action Required**: Implement HD wallet model before production deployment.
