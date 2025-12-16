# Salvium Hardware Wallet Firmware

This directory contains the firmware for the Salvium CryptoNote hardware wallet based on ESP32.

## Status: ALPHA - NOT PRODUCTION READY

⚠️ **WARNING**: This firmware is currently in early alpha development and should NOT be used with real funds.

## Overview

The Salvium hardware wallet implements CryptoNote cryptographic operations on an ESP32 microcontroller to provide secure key storage and transaction signing for the Salvium blockchain.

## Key Features (Planned)

- **Secure Key Storage**: Private spend and view keys stored in ESP32 secure storage
- **CryptoNote Crypto**: Ed25519/Curve25519 operations for Salvium
- **QR Code Interface**: Display addresses and signed transactions via QR codes
- **Transaction Signing**: Sign Salvium transactions without exposing private keys
- **Offline Operation**: Can operate without network connectivity

## Architecture

### Cryptographic Operations Required

1. **Key Derivation**
   - Derive view key from spend key using Keccak-256
   - Generate subaddresses using scalar multiplication

2. **Address Generation**
   - Public spend key = spend_key * G
   - Public view key = view_key * G
   - Address encoding with base58 and checksum

3. **Transaction Signing**
   - Ring signature generation (MLSAG)
   - Bulletproofs for range proofs
   - Key image computation

### Hardware Requirements

- ESP32 or ESP32-S3 (minimum 4MB flash)
- OLED/LCD display (128x64 or larger)
- Buttons for user interaction
- Optional: Camera module for QR scanning

## Development Status

### Completed
- ✅ Firmware manifest structure
- ✅ Web interface integration

### In Progress
- ⏳ CryptoNote cryptographic library port to ESP32
- ⏳ Key storage implementation
- ⏳ QR code generation

### Todo
- ❌ Ring signature implementation
- ❌ Bulletproofs implementation
- ❌ Transaction signing flow
- ❌ Security audit

## Building from Source

### Prerequisites

```bash
# Install PlatformIO
pip install platformio

# Or use Arduino IDE with ESP32 support
```

### Build Commands

```bash
# Clone the repository
git clone https://github.com/pdxwebdev/salvium-wallet.git
cd salvium-wallet

# Build the firmware
pio run

# Upload to ESP32
pio run --target upload
```

## Security Considerations

1. **Key Generation**: Keys should be generated on the device, never imported
2. **Secure Boot**: Enable ESP32 secure boot in production
3. **Flash Encryption**: Encrypt sensitive data in flash memory
4. **Physical Security**: Consider tamper-evident enclosures
5. **Side-Channel Protection**: Implement constant-time crypto operations

## CryptoNote Libraries

The firmware requires porting the following CryptoNote operations to ESP32:

- **Keccak**: For hashing and key derivation
- **Ed25519**: For public key cryptography
- **Curve25519**: For Diffie-Hellman key exchange
- **Base58**: For address encoding

Potential libraries to port:
- `monero-cpp` (C++ implementation)
- `libsodium` (Already has ESP32 port for basic operations)
- Custom implementation optimized for ESP32

## Testing

### Unit Tests

```bash
# Run tests on host machine
pio test -e native

# Run tests on device
pio test -e esp32dev
```

### Integration Tests

1. Generate test wallet on device
2. Compare addresses with official Salvium wallet
3. Sign test transactions and verify signatures
4. Test QR code scanning and generation

## Web Interface Integration

The hardware wallet integrates with the YadaCoin wallet web interface:

```javascript
// User can flash firmware via web browser
<esp-web-install-button 
  manifest="salvium-firmware/manifest.json">
</esp-web-install-button>
```

## Contributing

This is an open-source project. Contributions are welcome!

### Development Guidelines

1. Follow C++ best practices for embedded systems
2. Use constant-time operations for cryptography
3. Add unit tests for all crypto functions
4. Document all security-relevant code
5. Test on real hardware before submitting PRs

## License

Same as YadaCoin wallet - YOSL v1.1 (see LICENSE in root)

## Disclaimer

This hardware wallet is experimental software. Use at your own risk. The developers are not responsible for any loss of funds.

## Contact

- GitHub: https://github.com/pdxwebdev/salvium-wallet
- Email: info@yadacoin.io

## References

- [Salvium GitHub](https://github.com/salvium)
- [CryptoNote Whitepaper](https://cryptonote.org/whitepaper.pdf)
- [Monero Hardware Wallet](https://github.com/LedgerHQ/app-monero)
- [ESP32 Secure Boot](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/security/secure-boot-v2.html)
