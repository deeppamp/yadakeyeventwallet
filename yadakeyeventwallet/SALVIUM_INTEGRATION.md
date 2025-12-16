# Salvium Integration Guide

## Overview

Salvium blockchain has been integrated into the YadaKeyEventWallet. This document describes the implementation, current status, and next steps.

## What's Implemented

### 1. **Blockchain Configuration** (`src/shared/constants.js`)
- Added Salvium to the `BLOCKCHAINS` array with:
  - ID: `sal`
  - RPC URL: `http://rpc.salvium.io:18081`
  - Decimals: 12
  - Address prefix: `Sal`
  - Chain ID: 18080 (p2p port)
  - UI color: purple

### 2. **Wallet Manager** (`src/blockchains/YadaSalvium.js`)
Implemented core wallet operations:
- ✅ RPC communication with Salvium node
- ✅ Balance checking
- ✅ Transaction history building
- ✅ Address validation
- ✅ Private key validation
- ✅ Fee estimation
- ✅ Blockchain info retrieval
- ⚠️ Transaction signing (placeholder - needs CryptoNote libraries)
- ⚠️ Key derivation (placeholder - needs proper cryptography)

### 3. **Factory Registration** (`src/blockchains/WalletManagerFactory.js`)
- Added case for `sal` blockchain ID
- Returns `YadaSalvium` instance when Salvium is selected

### 4. **Hardware Wallet Support** (`src/components/Wallet2/Flasher.jsx`)
- Updated to support multiple blockchain firmwares
- Added firmware manifest mapping for different chains
- Shows appropriate message when Salvium firmware isn't available yet

### 5. **CryptoNote Utilities** (`src/utils/cryptonote.js`)
Implemented utility functions:
- ✅ Address validation (basic)
- ✅ Private key validation
- ✅ Atomic ↔ SAL conversion
- ✅ Amount formatting
- ✅ URI parsing (salvium://...)
- ✅ Transaction size estimation
- ⚠️ Address derivation (placeholder)
- ⚠️ Subaddress generation (placeholder)
- ⚠️ View key derivation (simplified)

## What's NOT Implemented (Requires CryptoNote Libraries)

### Critical Missing Components

1. **Proper Key Derivation**
   - Current: Simplified hash-based placeholder
   - Needed: ed25519/curve25519 elliptic curve operations
   - Libraries: `monero-javascript`, `mymonero-core-js`, or Salvium-specific

2. **Transaction Building & Signing**
   - Current: Placeholder that shows "not implemented" message
   - Needed: Ring signatures, stealth addresses, bulletproofs
   - Requires: Full CryptoNote cryptographic library

3. **Address Generation**
   - Current: Hash-based placeholder
   - Needed: Proper public key derivation and base58 encoding with checksum
   - Format: Must match Salvium's address specification

4. **Hardware Wallet Firmware**
   - Current: Placeholder manifest URL
   - Needed: ESP32 firmware with CryptoNote support
   - Repository: Need to create/fork salvium-wallet hardware implementation

## Testing the Current Implementation

### What You CAN Test:
1. **UI Integration**
   ```bash
   npm run dev
   ```
   - Navigate to Wallet2 page
   - Select "Salvium" from blockchain dropdown
   - Verify it loads without errors

2. **RPC Connectivity**
   - Check if `http://rpc.salvium.io:18081` is accessible
   - Test `getInfo()` and `getHeight()` methods

3. **Address Validation**
   - Test with sample Salvium addresses
   - Verify prefix and length checks work

### What You CANNOT Test (Yet):
1. ❌ Creating wallets
2. ❌ Sending transactions
3. ❌ Viewing real balances
4. ❌ Hardware wallet flashing
5. ❌ QR code key management

## Next Steps for Full Integration

### Phase 1: Core Cryptography (HIGH PRIORITY)
1. **Add CryptoNote Library**
   ```bash
   npm install monero-javascript
   # or salvium-specific library when available
   ```

2. **Implement Key Derivation**
   - Replace placeholder in `cryptonote.js`
   - Use proper ed25519 operations
   - Generate correct public keys from private keys

3. **Implement Address Generation**
   - Proper base58 encoding
   - Add checksum validation
   - Support integrated addresses and subaddresses

### Phase 2: Transaction Support (HIGH PRIORITY)
1. **Transaction Builder**
   - Ring signature construction
   - Stealth address generation
   - Input selection algorithm
   - Output creation

2. **Transaction Signing**
   - MLSAG/CLSAG signatures
   - Bulletproofs for range proofs
   - Key image generation

3. **Broadcasting**
   - Submit to Salvium daemon
   - Handle response and errors

### Phase 3: Wallet RPC Integration (MEDIUM PRIORITY)
1. **Connect to Wallet RPC**
   - Set up salvium-wallet-rpc
   - Implement wallet creation
   - Implement wallet restoration from seed

2. **Balance Management**
   - Query real balances
   - Track locked/unlocked amounts
   - Handle multiple subaddresses

### Phase 4: Hardware Wallet (MEDIUM PRIORITY)
1. **Create Firmware**
   - Fork/adapt existing CryptoNote hardware wallet
   - Implement for ESP32
   - Add QR code support for keys

2. **Update Manifest**
   - Host firmware files
   - Create proper manifest.json
   - Update Flasher component with real URL

### Phase 5: Advanced Features (LOW PRIORITY)
1. **Subaddress Management**
2. **Payment ID Support**
3. **Multi-signature Wallets**
4. **Transaction History Details**

## Configuration Notes

### RPC Endpoint
Current: `http://rpc.salvium.io:18081`

If you need to use a different node:
```javascript
// In src/blockchains/YadaSalvium.js
this.rpcUrl = "http://your-node:18081";
```

### Wallet RPC (Not Yet Configured)
When implementing wallet RPC:
```javascript
this.walletRpcUrl = "http://localhost:18082";
this.walletRpcUser = "user";
this.walletRpcPassword = "password";
```

## Known Limitations

1. **No Real Transaction Support**: All transaction-related operations are placeholders
2. **Simplified Key Management**: Current key derivation is not cryptographically correct
3. **No Hardware Wallet**: Firmware doesn't exist yet
4. **Limited Testing**: Cannot fully test without proper cryptography
5. **Placeholder Addresses**: Generated addresses are not valid on Salvium network

## Resources

- **Salvium**: https://salvium.io
- **Salvium RPC Documentation**: Check Salvium docs for RPC methods
- **CryptoNote Reference**: Monero documentation (similar structure)
- **Monero JavaScript**: https://github.com/monero-ecosystem/monero-javascript

## Questions?

For issues or questions about this integration:
1. Check if RPC endpoint is accessible
2. Verify you have the correct Salvium address format
3. Review console logs for detailed error messages
4. Consider contributing CryptoNote library integration!

## Contributing

To complete this integration:
1. Choose a CryptoNote library (monero-javascript recommended)
2. Implement proper key derivation in `cryptonote.js`
3. Implement transaction building in `YadaSalvium.js`
4. Test with Salvium testnet
5. Create hardware wallet firmware
6. Submit pull request!
