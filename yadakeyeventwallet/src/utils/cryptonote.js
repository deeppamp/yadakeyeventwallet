/**
 * CryptoNote Utility Functions for Salvium
 * 
 * This module provides CryptoNote cryptographic operations.
 * Salvium is based on CryptoNote protocol, similar to Monero.
 * 
 * Note: Full cryptographic operations require monero-ts which is Node.js only.
 * For browser environment, we provide basic validation and placeholders.
 */

// Browser environment - use Web Crypto API

// Salvium address configuration
export const SALVIUM_CONFIG = {
  addressPrefix: 'SC1',  // CARROT address prefix
  addressPrefixByte: 0x180c96, // CARROT_PUBLIC_ADDRESS_BASE58_PREFIX from salvium source
  integratedAddressPrefixByte: 0x2ccc96, // CARROT integrated address prefix
  subAddressPrefixByte: 0x314c96, // CARROT subaddress prefix
  decimals: 12,
  atomicUnits: 1e12,
};

/**
 * Validate a Salvium address (including CARROT integrated addresses)
 * @param {string} address - The address to validate
 * @returns {boolean} - Whether the address is valid
 */
export function isValidSalviumAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check prefix - Salvium supports standard and integrated addresses
  if (!address.startsWith(SALVIUM_CONFIG.addressPrefix)) {
    return false;
  }

  // Check length
  // Standard address: ~95 characters
  // Integrated address (for CARROT return transactions): ~106 characters
  // Subaddress: ~95 characters
  if (address.length < 95 || address.length > 110) {
    return false;
  }

  // Check if it's valid base58
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  const addressWithoutPrefix = address.substring(SALVIUM_CONFIG.addressPrefix.length);
  
  if (!base58Regex.test(addressWithoutPrefix)) {
    return false;
  }

  // TODO: Add checksum validation
  // This requires proper base58 decoding and CryptoNote address structure parsing
  
  return true;
}

/**
 * Check if address is an integrated address (used for CARROT return transactions)
 * @param {string} address - The address to check
 * @returns {boolean} - Whether this is an integrated address
 */
export function isIntegratedAddress(address) {
  if (!isValidSalviumAddress(address)) {
    return false;
  }
  // Integrated addresses are longer (contain payment ID)
  return address.length > 106;
}

/**
 * Validate a CryptoNote private key (spend key)
 * @param {string|Buffer} privateKey - The private key to validate
 * @returns {boolean} - Whether the private key is valid
 */
export function isValidCryptoNotePrivateKey(privateKey) {
  if (!privateKey) return false;

  let keyHex;
  
  if (typeof privateKey === 'string') {
    keyHex = privateKey;
  } else if (Buffer.isBuffer(privateKey)) {
    keyHex = privateKey.toString('hex');
  } else if (privateKey.privateKey) {
    keyHex = Buffer.from(privateKey.privateKey).toString('hex');
  } else {
    return false;
  }

  // CryptoNote private keys are 32 bytes (64 hex characters)
  return /^[0-9a-fA-F]{64}$/.test(keyHex);
}

/**
 * Convert atomic units to SAL
 * @param {number|string|bigint} atomic - Amount in atomic units
 * @returns {string} - Amount in SAL
 */
export function atomicToSAL(atomic) {
  const atomicBigInt = typeof atomic === 'bigint' ? atomic : BigInt(atomic || 0);
  const sal = Number(atomicBigInt) / SALVIUM_CONFIG.atomicUnits;
  return sal.toFixed(SALVIUM_CONFIG.decimals);
}

/**
 * Convert SAL to atomic units
 * @param {number|string} sal - Amount in SAL
 * @returns {bigint} - Amount in atomic units
 */
export function SALToAtomic(sal) {
  const salFloat = typeof sal === 'string' ? parseFloat(sal) : sal;
  return BigInt(Math.floor(salFloat * SALVIUM_CONFIG.atomicUnits));
}

/**
 * Format SAL amount for display
 * @param {number|string|bigint} amount - Amount in atomic units or SAL
 * @param {boolean} isAtomic - Whether the input is in atomic units
 * @returns {string} - Formatted amount
 */
export function formatSAL(amount, isAtomic = true) {
  const sal = isAtomic ? atomicToSAL(amount) : amount.toString();
  const parts = sal.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1] || '0'.repeat(SALVIUM_CONFIG.decimals);
  
  // Trim trailing zeros but keep at least 2 decimal places
  let trimmedDecimal = decimalPart.replace(/0+$/, '');
  if (trimmedDecimal.length < 2) {
    trimmedDecimal = trimmedDecimal.padEnd(2, '0');
  }
  
  return `${integerPart}.${trimmedDecimal} SAL`;
}

/**
 * Generate a deterministic subaddress (placeholder implementation)
 * 
 * NOTE: This is a simplified placeholder. Real CryptoNote subaddress generation
 * requires proper elliptic curve operations on ed25519/curve25519.
 * 
 * @param {string} privateSpendKey - The private spend key (hex)
 * @param {number} majorIndex - Major index for subaddress
 * @param {number} minorIndex - Minor index for subaddress
 * @returns {string} - Placeholder subaddress
 */
export function generateSubaddress(privateSpendKey, majorIndex = 0, minorIndex = 1) {
  // TODO: Implement proper CryptoNote subaddress derivation
  // This requires:
  // 1. Hash to scalar operation
  // 2. Scalar multiplication on curve25519
  // 3. Point addition
  // 4. Base58 encoding with checksum
  
  console.warn('Subaddress generation is not fully implemented. Using placeholder.');
  return `${SALVIUM_CONFIG.addressPrefix}SubAddr${majorIndex}_${minorIndex}_Placeholder`;
}

/**
 * Get address from private keys
 * 
 * @param {string} privateSpendKey - The private spend key (hex)
 * @param {string} privateViewKey - The private view key (hex)
 * @param {number} networkType - Network type (0=mainnet, 1=testnet, 2=stagenet)
 * @returns {string} - Salvium address (placeholder for browser)
 */
export async function getAddressFromKeys(privateSpendKey, privateViewKey, networkType = 0) {
  try {
    // Browser environment - generate placeholder address using Web Crypto API
    // For production, this should connect to wallet RPC or use WASM cryptography
    const encoder = new TextEncoder();
    const data = encoder.encode(privateSpendKey + privateViewKey + networkType);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 90);
    
    return `${SALVIUM_CONFIG.addressPrefix}${hashHex}`;
  } catch (error) {
    console.error('Error deriving address from keys:', error);
    return `${SALVIUM_CONFIG.addressPrefix}_PlaceholderAddress`;
  }
}

/**
 * Derive view key from spend key using hash
 * 
 * @param {string} privateSpendKey - The private spend key (hex)
 * @returns {string} - Derived private view key (hex)
 */
export async function deriveViewKey(privateSpendKey) {
  try {
    // Browser environment - use Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(privateSpendKey);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error deriving view key:', error);
    // Return a simple hash as fallback
    return privateSpendKey; // Placeholder
  }
}

/**
 * Parse a Salvium URI (salvium:<address>?amount=<amount>&message=<message>)
 * @param {string} uri - The URI to parse
 * @returns {object} - Parsed URI components
 */
export function parseSalviumURI(uri) {
  try {
    const url = new URL(uri);
    
    if (url.protocol !== 'salvium:') {
      throw new Error('Invalid Salvium URI protocol');
    }
    
    const address = url.hostname || url.pathname.replace('//', '');
    const amount = url.searchParams.get('amount');
    const message = url.searchParams.get('message');
    const paymentId = url.searchParams.get('tx_payment_id');
    
    return {
      address,
      amount: amount ? parseFloat(amount) : null,
      message: message ? decodeURIComponent(message) : null,
      paymentId,
    };
  } catch (error) {
    console.error('Error parsing Salvium URI:', error);
    return null;
  }
}

/**
 * Create a Salvium URI
 * @param {string} address - The recipient address
 * @param {number} amount - Optional amount in SAL
 * @param {string} message - Optional message
 * @param {string} paymentId - Optional payment ID
 * @returns {string} - Salvium URI
 */
export function createSalviumURI(address, amount = null, message = null, paymentId = null) {
  let uri = `salvium:${address}`;
  const params = new URLSearchParams();
  
  if (amount !== null) {
    params.append('amount', amount.toString());
  }
  
  if (message) {
    params.append('message', encodeURIComponent(message));
  }
  
  if (paymentId) {
    params.append('tx_payment_id', paymentId);
  }
  
  const queryString = params.toString();
  return queryString ? `${uri}?${queryString}` : uri;
}

/**
 * Estimate transaction size (simplified)
 * @param {number} numInputs - Number of inputs
 * @param {number} numOutputs - Number of outputs
 * @param {number} ringSize - Ring signature size (default 16 for Monero/Salvium)
 * @returns {number} - Estimated transaction size in bytes
 */
export function estimateTransactionSize(numInputs, numOutputs, ringSize = 16) {
  // Simplified estimation
  // Real CryptoNote transactions have complex size calculations
  const baseSize = 100; // Base transaction overhead
  const inputSize = (80 + (ringSize * 32)); // Input with ring signature
  const outputSize = 78; // Output size
  
  return baseSize + (numInputs * inputSize) + (numOutputs * outputSize);
}

/**
 * Calculate transaction fee based on size and fee per byte
 * @param {number} txSize - Transaction size in bytes
 * @param {number} feePerByte - Fee per byte in atomic units
 * @returns {bigint} - Total fee in atomic units
 */
export function calculateTransactionFee(txSize, feePerByte) {
  return BigInt(Math.ceil(txSize * feePerByte));
}

export default {
  SALVIUM_CONFIG,
  isValidSalviumAddress,
  isIntegratedAddress,
  isValidCryptoNotePrivateKey,
  atomicToSAL,
  SALToAtomic,
  formatSAL,
  generateSubaddress,
  getAddressFromKeys,
  deriveViewKey,
  parseSalviumURI,
  createSalviumURI,
  estimateTransactionSize,
  calculateTransactionFee,
};
