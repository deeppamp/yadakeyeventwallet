import { useState, useEffect } from 'react';
import hardwareWallet from '../utils/hardwareWallet';

export default function HardwareWalletConnect({ currentBalance, currentCoin, currentAddress }) {
  const [connected, setConnected] = useState(false);
  const [hwAddress, setHwAddress] = useState(null);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [rotationSuccess, setRotationSuccess] = useState(null);

  useEffect(() => {
    // Check if Web Serial API is supported
    if (!hardwareWallet.isSupported()) {
      setSupported(false);
      setError('Web Serial API not supported. Use Chrome, Edge, or Opera.');
    }

    // Set up callbacks
    hardwareWallet.setOnAddressUpdate((coin, address) => {
      console.log(`Hardware wallet ${coin} address:`, address);
      setHwAddress(address);
    });

    hardwareWallet.setOnRotationComplete((success) => {
      console.log('Key rotation completed:', success);
      setRotating(false);
      setRotationSuccess(success);
      // Clear success message after 5 seconds
      setTimeout(() => setRotationSuccess(null), 5000);
    });

    return () => {
      hardwareWallet.setOnAddressUpdate(null);
      hardwareWallet.setOnRotationComplete(null);
    };
  }, []);

  // Update balance when it changes
  useEffect(() => {
    if (connected && currentBalance !== null && currentCoin) {
      hardwareWallet.updateBalance(currentCoin, currentBalance)
        .catch(err => console.error('Failed to update balance:', err));
    }
  }, [connected, currentBalance, currentCoin]);

  const handleConnect = async () => {
    try {
      setError(null);
      await hardwareWallet.connect();
      setConnected(true);
      
      // Request addresses
      await hardwareWallet.getAddresses();
      
      // Send current balance if available
      if (currentBalance !== null && currentCoin) {
        await hardwareWallet.updateBalance(currentCoin, currentBalance);
      }
    } catch (err) {
      setError(err.message);
      setConnected(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await hardwareWallet.disconnect();
      setConnected(false);
      setHwAddress(null);
      setRotationSuccess(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRotateKey = async (coin) => {
    if (!connected) {
      setError('Hardware wallet not connected');
      return;
    }

    try {
      setRotating(true);
      setError(null);
      setRotationSuccess(null);

      // Generate new address (simplified - in production use proper HD wallet derivation)
      const timestamp = Date.now();
      const coinPrefix = coin === 'YadaCoin' ? 'YDA' : 'SAL';
      const newAddress = `${coinPrefix}${timestamp.toString(16)}`;

      console.log(`Rotating ${coin} key from ${currentAddress} to ${newAddress}`);

      // Send rotation command to hardware wallet
      await hardwareWallet.rotateKey(coin, currentAddress || hwAddress, newAddress);

      // The onRotationComplete callback will handle the response
    } catch (err) {
      setError(`Key rotation failed: ${err.message}`);
      setRotating(false);
    }
  };

  if (!supported) {
    return (
      <div style={{
        padding: '16px',
        margin: '16px 0',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        color: '#856404'
      }}>
        <strong>⚠️ Browser Not Supported</strong>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
          Hardware wallet requires Chrome, Edge, or Opera browser with Web Serial API support.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      margin: '16px 0',
      backgroundColor: connected ? '#d4edda' : '#f8f9fa',
      border: `2px solid ${connected ? '#28a745' : '#dee2e6'}`,
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>
            {connected ? '🔗' : '📱'}
          </span>
          <div>
            <strong style={{ fontSize: '16px' }}>Hardware Wallet</strong>
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
              {connected ? 'ESP32-2432S028 Connected' : 'Not Connected'}
            </div>
          </div>
        </div>
        
        {connected ? (
          <button
            onClick={handleDisconnect}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Connect USB
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          fontSize: '14px',
          marginTop: '12px'
        }}>
          ❌ {error}
        </div>
      )}

      {connected && hwAddress && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'white',
          border: '1px solid #28a745',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
            Hardware Wallet Address:
          </div>
          <div style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#495057',
            wordBreak: 'break-all',
            backgroundColor: '#f8f9fa',
            padding: '8px',
            borderRadius: '4px'
          }}>
            {hwAddress}
          </div>
        </div>
      )}

      {rotationSuccess !== null && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: rotationSuccess ? '#d4edda' : '#f8d7da',
          border: `1px solid ${rotationSuccess ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: rotationSuccess ? '#155724' : '#721c24',
          fontSize: '14px',
          marginTop: '12px'
        }}>
          {rotationSuccess ? '✅ Key rotation successful!' : '❌ Key rotation failed'}
        </div>
      )}

      {connected && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'white',
          border: '1px solid #28a745',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
            <strong>🔑 Key Rotation:</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => handleRotateKey('YadaCoin')}
              disabled={rotating}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: rotating ? '#6c757d' : '#ffc107',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: rotating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => !rotating && (e.target.style.backgroundColor = '#e0a800')}
              onMouseOut={(e) => !rotating && (e.target.style.backgroundColor = '#ffc107')}
            >
              {rotating ? '⏳ Rotating...' : '🔄 Rotate YadaCoin Key'}
            </button>
            <button
              onClick={() => handleRotateKey('Salvium')}
              disabled={rotating}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: rotating ? '#6c757d' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: rotating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => !rotating && (e.target.style.backgroundColor = '#138496')}
              onMouseOut={(e) => !rotating && (e.target.style.backgroundColor = '#17a2b8')}
            >
              {rotating ? '⏳ Rotating...' : '🔄 Rotate Salvium Key'}
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#6c757d', fontStyle: 'italic' }}>
            ℹ️ Key rotation generates a new address and updates the hardware wallet display
          </div>
        </div>
      )}

      {connected && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'white',
          border: '1px solid #28a745',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
            <strong>✅ Hardware Wallet Features:</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#495057' }}>
            <li>Real-time balance display on 2.8" screen</li>
            <li>Touchscreen navigation + BOOT button</li>
            <li>QR code address display</li>
            <li>Secure key rotation</li>
            <li>Offline transaction signing (coming soon)</li>
          </ul>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
            ℹ️ Use touchscreen or BOOT button to navigate: Touch = direct select, BOOT = cycle menu
          </div>
        </div>
      )}
    </div>
  );
}
