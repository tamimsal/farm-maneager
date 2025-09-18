# 🚨 Farm Manager Connection Troubleshooting Guide

## 🔍 **Quick Diagnosis**

### **Step 1: Check Connection Status**
Look at your dashboard - what does it show?
- ✅ **CONNECTED** (Green) = Working perfectly
- 🟡 **CONNECTING** (Yellow) = Trying to connect
- 🔴 **DISCONNECTED** (Red) = Connection failed
- ❌ **ERROR** (Red) = Max retries reached

### **Step 2: Check Browser Console (F12)**
Look for these messages:
- `[FarmSocket] Using WebSocket URL: ws://...`
- `[FarmSocket] Attempting connection to: ws://...`
- `[FarmSocket] Connection established successfully`

## 🛠️ **Fix Connection Issues**

### **Option A: Use Your ESP32 (Recommended)**

1. **Find Your ESP32's IP Address:**
   - Check your router's admin panel
   - Look for device named "ESP32" or "FARM-ESP32"
   - Common IPs: `192.168.1.100`, `192.168.1.50`, `10.0.0.100`

2. **Test Direct Connection:**
   ```
   http://localhost:3000/?ws=ws://YOUR_ESP32_IP:81
   ```
   Example: `http://localhost:3000/?ws=ws://192.168.1.100:81`

3. **If mDNS works on your network:**
   ```
   http://localhost:3000/?ws=ws://farm.local:81
   ```

### **Option B: Test with Local Server**

1. **Install WebSocket dependency:**
   ```bash
   npm install ws
   ```

2. **Start test server:**
   ```bash
   npm run server
   ```

3. **Connect to test server:**
   ```
   http://localhost:3000/?ws=ws://localhost:8080
   ```

### **Option C: Manual Configuration**

1. **Set localStorage (persistent):**
   ```javascript
   localStorage.setItem('farm_ws_url', 'ws://YOUR_ESP32_IP:81')
   ```

2. **Set environment variable:**
   Create `.env.local` file:
   ```
   REACT_APP_WS_URL=ws://YOUR_ESP32_IP:81
   ```

## 🔧 **ESP32 Network Issues**

### **Check ESP32 Status:**
1. **Power LED** should be on
2. **WiFi LED** should be blinking/steady
3. **Serial Monitor** should show:
   ```
   WiFi connected (STA)
   IP address: 192.168.x.x
   WebSocket server started on ws://<this-ip>:81/
   mDNS ready: http://farm.local/  ws://farm.local:81/
   ```

### **Network Requirements:**
- ✅ ESP32 and computer on same WiFi network
- ✅ ESP32 has internet access
- ✅ Port 81 not blocked by firewall
- ✅ Router supports mDNS (most do)

### **ESP32 WiFi Issues:**
1. **Check WiFi credentials** in firmware
2. **Verify network name** and password
3. **Check WiFi signal strength**
4. **Restart ESP32** if needed

## 📱 **Testing Steps**

### **Test 1: Local Test Server**
```bash
npm install ws
npm run server
# In another terminal:
npm start
# Then visit: http://localhost:3000/?ws=ws://localhost:8080
```

### **Test 2: ESP32 Direct IP**
1. Find ESP32 IP in router or serial monitor
2. Visit: `http://localhost:3000/?ws=ws://ESP32_IP:81`
3. Should show "CONNECTED" status

### **Test 3: mDNS (farm.local)**
1. Visit: `http://localhost:3000/?ws=ws://farm.local:81`
2. Works if your network supports mDNS

## 🚨 **Common Errors & Solutions**

### **Error: "WebSocket connection failed"**
- **Cause:** ESP32 not accessible at that IP/port
- **Solution:** Check ESP32 IP, network, and firewall

### **Error: "Connection refused"**
- **Cause:** ESP32 not running or wrong port
- **Solution:** Check ESP32 power and serial monitor

### **Error: "farm.local not found"**
- **Cause:** mDNS not working on your network
- **Solution:** Use direct IP address instead

### **Error: "Max reconnection attempts reached"**
- **Cause:** Network issues or wrong WebSocket URL
- **Solution:** Check connection settings and try different URLs

## 🎯 **Success Checklist**

- [ ] Dashboard shows "CONNECTED" status
- [ ] Real-time sensor data updates every 2 seconds
- [ ] Temperature, humidity, moisture, tank level show values
- [ ] Charts display data over time
- [ ] No connection errors in browser console

## 📞 **Still Having Issues?**

1. **Check ESP32 serial monitor** for error messages
2. **Verify network connectivity** between devices
3. **Try different connection methods** (direct IP vs mDNS)
4. **Check firewall settings** on your network
5. **Restart both ESP32 and computer**

## 🔗 **Useful Links**

- **ESP32 WebSocket Library:** https://github.com/Links2004/arduinoWebSockets
- **mDNS Documentation:** https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/protocols/mdns.html
- **WebSocket Testing:** https://www.piesocket.com/websocket-tester

