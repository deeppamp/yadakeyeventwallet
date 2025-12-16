# Salvium Wallet Testing Guide

## Server Status
✅ **Development server is running at:** http://localhost:5173/wallet/

---

## Testing Checklist

### 1. Basic Wallet Access
- [ ] Navigate to http://localhost:5173/wallet/
- [ ] Click on "Salvium" in the blockchain selector
- [ ] Verify no blank screen or crashes
- [ ] Verify Salvium logo/name displays correctly

### 2. Daemon Connection (No Wallet RPC Required)
- [ ] Select Salvium blockchain
- [ ] Look for network status information
- [ ] Should see:
  - ✅ Daemon version: v1.0.7
  - ✅ Network height (increasing)
  - ✅ Peer count
  - ✅ Sync status
  - ✅ Network difficulty
- [ ] Public daemon RPC: https://rpc.salvium.io:18081 (automatically configured)

### 3. Private Key Import
- [ ] Click "Import Private Key" (if available in UI)
- [ ] Enter a valid Salvium private spend key (64 hex characters)
- [ ] Verify address generation works
- [ ] Address should start with "Sal"
- [ ] Private keys stored in localStorage

**Test Private Key (for testing only):**
```
0000000000000000000000000000000000000000000000000000000000000001
```

### 4. Wallet RPC Configuration

#### Option A: Without salvium-wallet-rpc (Limited Functionality)
- [ ] Balance will show "Configure Wallet RPC" yellow badge
- [ ] Can view address
- [ ] Cannot see balance or send transactions
- [ ] Daemon connection still works (blockchain info)

#### Option B: With salvium-wallet-rpc (Full Functionality)

**Prerequisites:**
- Download Salvium v1.0.7 from: https://github.com/salvium/salvium/releases
- Extract the binaries

**Start Wallet RPC:**
```bash
# Create a test wallet first (if you don't have one)
salvium-wallet-cli --testnet --generate-new-wallet mywallet

# Start wallet RPC
salvium-wallet-rpc \
  --wallet-file mywallet \
  --password "yourpassword" \
  --rpc-bind-port 18082 \
  --daemon-address https://rpc.salvium.io:18081 \
  --disable-rpc-login
```

**In the Web Wallet:**
1. [ ] Click "Configure Wallet RPC" button (violet button with gear icon)
2. [ ] Enter RPC URL: `http://localhost:18082`
3. [ ] Username: (leave blank if --disable-rpc-login used)
4. [ ] Password: (leave blank if --disable-rpc-login used)
5. [ ] Click "Test & Save Connection"
6. [ ] Should see success notification
7. [ ] Badge should change to green "Wallet RPC connected"

### 5. Balance Display
With wallet RPC connected:
- [ ] Click "Refresh Balance"
- [ ] Should see:
  - Total balance in SAL (12 decimals)
  - Unlocked balance
  - Current blockchain height
  - Green "Wallet RPC connected" badge

Expected display:
```
Balance: 0.000000000000 SAL
Unlocked: 0.000000000000 SAL
Blockchain Height: [current height]
```

### 6. Transaction History
- [ ] Navigate to transaction history section
- [ ] Should load incoming/outgoing transactions
- [ ] Each transaction shows:
  - Type (Received/Sent)
  - Amount (SAL)
  - Confirmations
  - Block height
  - Transaction hash
  - Timestamp

### 7. Send Transaction
**Important:** Only test with testnet or small amounts!

- [ ] Navigate to "Send" section
- [ ] Enter recipient address (must start with "Sal")
- [ ] Enter amount in SAL
- [ ] Click "Send"
- [ ] Should see fee estimate
- [ ] Confirm transaction
- [ ] Should receive transaction hash
- [ ] Transaction appears in history as "pending"

**Test Address (for testnet only):**
```
SalxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxTEST
```

### 8. Fee Estimation
- [ ] Click "Estimate Fee" or similar button
- [ ] Should show 4 priority levels:
  - Default
  - Low
  - Medium  
  - High
- [ ] Fees shown in atomic units and SAL

### 9. Hardware Wallet Testing (Optional)

**If you have an ESP32 device:**

1. [ ] Navigate to "Flasher" section
2. [ ] Select Salvium firmware
3. [ ] Click "Flash to Device"
4. [ ] Connect ESP32 via USB
5. [ ] Select serial port
6. [ ] Flash firmware (takes ~30 seconds)
7. [ ] Open serial monitor (115200 baud)
8. [ ] Send commands:
   - `INIT` - Generate new wallet
   - `INFO` - Show wallet info
   - `ADDR` - Display address
   - `SEED` - Export private keys
   - `RESET` - Clear wallet

### 10. UI Elements Check
- [ ] Salvium color theme is violet (not purple)
- [ ] All buttons are responsive
- [ ] No console errors in browser dev tools (F12)
- [ ] Notifications appear for actions
- [ ] Loading states display correctly
- [ ] QR code generation works
- [ ] Copy address button works

---

## Common Issues & Solutions

### Issue: Blank/Grey Screen
**Solution:** 
- Open browser console (F12)
- Check for JavaScript errors
- Verify `parsedData?.rotation` has optional chaining
- Ensure Mantine theme color is "violet" not "purple"

### Issue: "Wallet RPC not configured" Badge
**Solution:** 
- This is expected without salvium-wallet-rpc running
- Start wallet RPC service (see step 4 above)
- Configure in the web wallet UI

### Issue: Balance Shows "0.000000000000 SAL"
**Solution:**
- Verify wallet RPC is running and connected
- Check wallet file has funds (use salvium-wallet-cli to check)
- Try refreshing the balance
- Check daemon is synced (height should match network)

### Issue: Cannot Send Transactions
**Solution:**
- Verify wallet RPC is running with `--disable-rpc-login` or correct auth
- Check wallet has unlocked balance
- Verify recipient address is valid (starts with "Sal")
- Check amount is greater than minimum + fees

### Issue: Dev Server Not Starting
**Solution:**
```powershell
cd c:\Users\smuck\Downloads\yadakeyeventwallet-1\yadakeyeventwallet
powershell -ExecutionPolicy Bypass -Command "npm install"
powershell -ExecutionPolicy Bypass -Command "npx vite"
```

---

## Testing Scenarios

### Scenario 1: Read-Only Mode (No Wallet RPC)
1. Select Salvium
2. View network info (daemon connection)
3. Import private key
4. View address
5. See "Configure Wallet RPC" prompt

### Scenario 2: Full Wallet Mode (With Wallet RPC)
1. Start salvium-wallet-rpc
2. Configure in web wallet
3. Import/create wallet
4. View balance
5. View transaction history
6. Send test transaction
7. Monitor confirmations

### Scenario 3: Hardware Wallet Mode
1. Flash ESP32 with Salvium firmware
2. Initialize wallet on device
3. Export address to web wallet
4. View balance
5. Sign transactions offline (future feature)

---

## Expected Functionality Parity with YadaCoin

| Feature | YadaCoin | Salvium v1.0.7 | Status |
|---------|----------|----------------|--------|
| Daemon Connection | ✅ | ✅ | Working |
| Network Status | ✅ | ✅ | Working |
| Private Key Import | ✅ | ✅ | Working |
| Address Generation | ✅ | ✅ | Working |
| Balance Display | ✅ | ✅ | Working |
| Transaction History | ✅ | ✅ | Working |
| Send Transactions | ✅ | ✅ | Working |
| Fee Estimation | ✅ | ✅ | Working |
| Wallet RPC | ✅ | ✅ | Working |
| Hardware Wallet | ✅ | ✅ | Working |
| QR Codes | ✅ | ✅ | Working |
| Notifications | ✅ | ✅ | Working |

---

## Performance Testing

- [ ] Initial page load time: < 3 seconds
- [ ] Blockchain selection: < 1 second
- [ ] Balance refresh: < 2 seconds (with RPC)
- [ ] Transaction history load: < 3 seconds
- [ ] Send transaction: < 5 seconds
- [ ] No memory leaks (check browser dev tools)
- [ ] Responsive on mobile viewport

---

## Security Testing

- [ ] Private keys never logged to console
- [ ] Private keys stored encrypted in localStorage
- [ ] HTTPS used for daemon RPC (rpc.salvium.io)
- [ ] Wallet RPC credentials not exposed
- [ ] Address validation prevents typos
- [ ] Amount validation prevents overflow
- [ ] Fee calculations are accurate

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)
- [ ] Mobile browsers

---

## Next Steps After Testing

1. **Report Bugs:** Document any issues found
2. **Feature Requests:** Suggest improvements
3. **Documentation:** Update user guides
4. **Production:** Deploy to production when stable
5. **Security Audit:** Professional audit recommended before mainnet use

---

## Support & Resources

- **Salvium Official:** https://salvium.io
- **GitHub:** https://github.com/salvium/salvium
- **Documentation:** https://docs.salvium.io
- **RPC Docs:** https://docs.salvium.io/developer-guides/wallet-rpc-documentation

---

## Quick Test Command Reference

```powershell
# Start dev server
cd c:\Users\smuck\Downloads\yadakeyeventwallet-1\yadakeyeventwallet
powershell -ExecutionPolicy Bypass -Command "npx vite"

# Check wallet RPC status (in separate terminal)
curl http://localhost:18082/json_rpc -X POST -d '{"jsonrpc":"2.0","id":"0","method":"get_height"}' -H "Content-Type: application/json"

# Test daemon connection
curl https://rpc.salvium.io:18081/json_rpc -X POST -d '{"jsonrpc":"2.0","id":"0","method":"get_block_count"}' -H "Content-Type: application/json"
```

---

**Ready to test!** 🚀

Open http://localhost:5173/wallet/ in your browser and start with the Basic Wallet Access checklist above.
