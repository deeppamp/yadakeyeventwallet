/**
 * Hardware Wallet Integration via Web Serial API
 * Communicates with ESP32 hardware wallet over USB
 */

class HardwareWallet {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.connected = false;
    this.onBalanceUpdate = null;
    this.onAddressUpdate = null;
  }

  /**
   * Check if Web Serial API is supported
   */
  isSupported() {
    return 'serial' in navigator;
  }

  /**
   * Connect to hardware wallet
   */
  async connect() {
    if (!this.isSupported()) {
      throw new Error('Web Serial API not supported in this browser. Use Chrome, Edge, or Opera.');
    }

    try {
      // Request port from user
      this.port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x10C4 }, // Silicon Labs CP210x
          { usbVendorId: 0x1A86 }, // CH340
          { usbVendorId: 0x0403 }, // FTDI
        ]
      });

      // Open port with ESP32 settings
      await this.port.open({ 
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      this.connected = true;

      // Set up reader and writer
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();

      // Start reading responses
      this.startReading();

      // Test connection
      await this.sendCommand('PING');

      console.log('[Hardware Wallet] Connected successfully');
      return true;
    } catch (error) {
      console.error('[Hardware Wallet] Connection failed:', error);
      this.connected = false;
      throw error;
    }
  }

  /**
   * Disconnect from hardware wallet
   */
  async disconnect() {
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      this.connected = false;
      console.log('[Hardware Wallet] Disconnected');
    } catch (error) {
      console.error('[Hardware Wallet] Disconnect error:', error);
    }
  }

  /**
   * Send command to hardware wallet
   */
  async sendCommand(command) {
    if (!this.connected || !this.writer) {
      throw new Error('Hardware wallet not connected');
    }

    try {
      await this.writer.write(command + '\n');
      console.log('[Hardware Wallet] Sent:', command);
    } catch (error) {
      console.error('[Hardware Wallet] Send error:', error);
      throw error;
    }
  }

  /**
   * Update balance on hardware wallet display
   */
  async updateBalance(coin, balance) {
    const coinCode = coin === 'YadaCoin' ? 'YDA' : 'SAL';
    await this.sendCommand(`BALANCE:${coinCode}:${balance}`);
  }

  /**
   * Request addresses from hardware wallet
   */
  async getAddresses() {
    await this.sendCommand('GET_ADDRESSES');
    // Addresses will be received via startReading()
  }

  /**
   * Get hardware wallet status
   */
  async getStatus() {
    await this.sendCommand('GET_STATUS');
    // Status will be received via startReading()
  }

  /**
   * Rotate key on hardware wallet
   * @param {string} coin - Coin name ('YadaCoin' or 'Salvium')
   * @param {string} oldAddress - Current address
   * @param {string} newAddress - New address to rotate to
   */
  async rotateKey(coin, oldAddress, newAddress) {
    const coinCode = coin === 'YadaCoin' ? 'YDA' : 'SAL';
    await this.sendCommand(`ROTATE_KEY:${coinCode}:${oldAddress}:${newAddress}`);
    // Response will be received via startReading()
  }

  /**
   * Sign transaction on hardware wallet
   * @param {string} coin - Coin name ('YadaCoin' or 'Salvium')
   * @param {string} txData - Transaction data to sign
   */
  async signTransaction(coin, txData) {
    const coinCode = coin === 'YadaCoin' ? 'YDA' : 'SAL';
    await this.sendCommand(`SIGN_TX:${coinCode}:${txData}`);
    // Signature will be received via startReading()
  }

  /**
   * Read responses from hardware wallet
   */
  async startReading() {
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;

        // Process each line
        const lines = value.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            this.processResponse(trimmed);
          }
        }
      }
    } catch (error) {
      if (error.name !== 'NetworkError') {
        console.error('[Hardware Wallet] Read error:', error);
      }
    }
  }

  /**
   * Process response from hardware wallet
   */
  processResponse(response) {
    console.log('[Hardware Wallet] Received:', response);

    if (response === 'PONG') {
      console.log('[Hardware Wallet] Connection confirmed');
    } else if (response.startsWith('ADDRESS:')) {
      // Format: ADDRESS:YDA:YDA4434bc65af6d1ea9f04713a25ee...
      const parts = response.split(':');
      if (parts.length >= 3) {
        const coinCode = parts[1];
        const address = parts[2];
        const coin = coinCode === 'YDA' ? 'YadaCoin' : 'Salvium';
        
        if (this.onAddressUpdate) {
          this.onAddressUpdate(coin, address);
        }
      }
    } else if (response.startsWith('STATUS:')) {
      // Format: STATUS:READY or STATUS:DEVICE:ESP32-2432S028:TOUCH:YES:SCREEN:1
      console.log('[Hardware Wallet] Status:', response);
    } else if (response.startsWith('ROTATION:')) {
      // Format: ROTATION:SUCCESS
      console.log('[Hardware Wallet] Key rotation:', response);
      if (response === 'ROTATION:SUCCESS' && this.onRotationComplete) {
        this.onRotationComplete(true);
      }
    } else if (response.startsWith('SIGNATURE:')) {
      // Format: SIGNATURE:hex_signature_data
      const signature = response.substring('SIGNATURE:'.length);
      console.log('[Hardware Wallet] Transaction signed:', signature);
      if (this.onSignature) {
        this.onSignature(signature);
      }
    } else if (response.startsWith('[KEY_ROTATION]')) {
      console.log('[Hardware Wallet] Rotation info:', response);
    } else if (response.startsWith('[OK]')) {
      console.log('[Hardware Wallet]', response);
    } else if (response.startsWith('[BUTTON]')) {
      console.log('[Hardware Wallet]', response);
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Set callback for address updates
   */
  setOnAddressUpdate(callback) {
    this.onAddressUpdate = callback;
  }

  /**
   * Set callback for key rotation completion
   */
  setOnRotationComplete(callback) {
    this.onRotationComplete = callback;
  }

  /**
   * Set callback for transaction signatures
   */
  setOnSignature(callback) {
    this.onSignature = callback;
  }
}

// Singleton instance
const hardwareWallet = new HardwareWallet();

export default hardwareWallet;
