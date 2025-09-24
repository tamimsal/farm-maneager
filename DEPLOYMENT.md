# Farm Manager - Company Domain Deployment Guide

Complete guide to deploy the Farm Manager IoT system to a company domain.

## What This System Does

- **ESP32**: Collects sensor data (temperature, humidity, soil moisture, water level) and controls water pump
- **React Dashboard**: Real-time web interface accessible via company domain
- **WebSocket**: Real-time communication between ESP32 and dashboard

## Quick Deployment Steps

### 1. Hardware Setup

**ESP32 Pin Connections:**
```
DHT11 Data     → GPIO 27
Ultrasonic Trig → GPIO 25  
Ultrasonic Echo → GPIO 14
Soil Moisture  → GPIO 34
Pump IN1       → GPIO 32
Pump IN2       → GPIO 35
```

### 2. ESP32 Firmware (Production Version)

**Install Arduino IDE + ESP32 support:**
1. Download Arduino IDE
2. Add ESP32 board URL: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Install ESP32 board package
4. Install libraries: DHT sensor library, WebSockets by Links2004

**Configure for Company Network:**
```cpp
// Update these in firmware/farmproject/farmproject.ino
const char* WIFI_SSID = "COMPANY_WIFI_NAME";
const char* WIFI_PASSWORD = "COMPANY_WIFI_PASSWORD";

// PRODUCTION: Disable AP mode (change line 143)
WiFi.mode(WIFI_STA); // Station mode only, no AP

// Comment out AP setup (lines 146-152)
// bool apOk = WiFi.softAP(AP_SSID, AP_PASSWORD);
// ... rest of AP code
```

**Upload to ESP32:**
1. Connect ESP32 via USB
2. Select board: ESP32 Dev Module
3. Select correct COM port
4. Click Upload
5. Open Serial Monitor (115200 baud) to verify connection

### 3. React App Deployment

**Build the App:**
```bash
cd farm-manager
npm install
npm run build
```

**Deploy Options:**

**Option A: Simple Web Server (Nginx)**
```nginx
server {
    listen 80;
    server_name your-company-domain.com;
    root /var/www/farm-manager/build;
    index index.html;

    # Handle React routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy WebSocket to ESP32
    location /ws {
        proxy_pass http://ESP32_IP:81;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Option B: Cloud Hosting (Netlify/Vercel)**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Environment variable: `REACT_APP_WS_URL=wss://your-domain.com/ws`

### 4. Company Domain Setup

**DNS Configuration:**
```
A Record: your-company-domain.com → YOUR_SERVER_IP
CNAME: www.your-company-domain.com → your-company-domain.com
```

**SSL Certificate (HTTPS):**
```bash
# Let's Encrypt (free)
sudo apt install certbot nginx
sudo certbot --nginx -d your-company-domain.com
```

**Update React App for HTTPS:**
```typescript
// In src/hooks/useFarmSocket.ts, change default URL:
const defaultUrl = 'wss://your-company-domain.com/ws';
```

### 5. Network Configuration

**ESP32 Static IP (Recommended):**
```cpp
// Add to connectWifi() function after WiFi.begin()
IPAddress local_IP(192, 168, 1, 100);  // Coordinate with IT
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
WiFi.config(local_IP, gateway, subnet);
```

**Firewall Rules:**
```bash
# Allow web traffic
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 81  # WebSocket
```

## Company Deployment Checklist

### Before Deployment:
- [ ] Get IT approval for IoT device on corporate network
- [ ] Obtain company WiFi credentials
- [ ] Coordinate static IP assignment with IT
- [ ] Disable AP mode in ESP32 firmware
- [ ] Set up domain and SSL certificate
- [ ] Configure firewall rules

### After Deployment:
- [ ] Test all sensor readings
- [ ] Verify pump control functionality
- [ ] Check WebSocket connection stability
- [ ] Set up monitoring and alerts
- [ ] Document network configuration
- [ ] Create backup procedures

## Required Code Changes

### 1. ESP32 Firmware Changes

**File: `firmware/farmproject/farmproject.ino`**

**Change 1: Update WiFi Credentials (Lines 22-23)**
```cpp
// FROM:
const char* WIFI_SSID = "ASSD";
const char* WIFI_PASSWORD = "Aeliasoft@2024";

// TO:
const char* WIFI_SSID = "YOUR_COMPANY_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_COMPANY_WIFI_PASSWORD";
```

**Change 2: Disable AP Mode (Line 143)**
```cpp
// FROM:
WiFi.mode(WIFI_AP_STA); // run both AP and STA

// TO:
WiFi.mode(WIFI_STA); // PRODUCTION: Station mode only, no AP
```

**Change 3: Comment Out AP Setup (Lines 146-152)**
```cpp
// FROM:
// Start SoftAP immediately so you always have a way in
bool apOk = WiFi.softAP(AP_SSID, AP_PASSWORD);
if (apOk) {
  Serial.print("SoftAP started: "); Serial.println(AP_SSID);
  Serial.print("SoftAP IP: "); Serial.println(WiFi.softAPIP());
} else {
  Serial.println("SoftAP start failed");
}

// TO:
// PRODUCTION: AP mode disabled for security
/*
bool apOk = WiFi.softAP(AP_SSID, AP_PASSWORD);
if (apOk) {
  Serial.print("SoftAP started: "); Serial.println(AP_SSID);
  Serial.print("SoftAP IP: "); Serial.println(WiFi.softAPIP());
} else {
  Serial.println("SoftAP start failed");
}
*/
```

**Change 4: Add Static IP Configuration (After Line 155)**
```cpp
// Add this after WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
// Static IP configuration for production
IPAddress local_IP(192, 168, 1, 100);  // Coordinate with IT department
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);
IPAddress secondaryDNS(8, 8, 4, 4);

if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("STA Failed to configure static IP");
}
```

### 2. React App Changes

**File: `src/hooks/useFarmSocket.ts`**

**Change 1: Update Default WebSocket URL (Line 139)**
```typescript
// FROM:
return (process.env.REACT_APP_WS_URL as string) || 'ws://farm.local:81';

// TO:
return (process.env.REACT_APP_WS_URL as string) || 'wss://your-company-domain.com/ws';
```

**File: Create `.env.production`**
```env
# Production Environment Variables
REACT_APP_WS_URL=wss://your-company-domain.com/ws
GENERATE_SOURCEMAP=false
```

**Steps to create the file:**
```bash
# Create the environment file
echo "REACT_APP_WS_URL=wss://your-company-domain.com/ws" > .env.production
echo "GENERATE_SOURCEMAP=false" >> .env.production
```

### 3. Nginx Configuration

**File: `/etc/nginx/sites-available/farm-manager`**
```nginx
server {
    listen 80;
    server_name your-company-domain.com;
    root /var/www/farm-manager/build;
    index index.html;

    # Handle React routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy WebSocket to ESP32
    location /ws {
        proxy_pass http://192.168.1.100:81;  # ESP32 static IP
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Production Configuration

### ESP32 Firmware Changes for Production:

```cpp
// 1. Disable AP mode
WiFi.mode(WIFI_STA); // Line 143

// 2. Comment out AP setup (lines 146-152)
/*
bool apOk = WiFi.softAP(AP_SSID, AP_PASSWORD);
if (apOk) {
  Serial.print("SoftAP started: "); Serial.println(AP_SSID);
  Serial.print("SoftAP IP: "); Serial.println(WiFi.softAPIP());
} else {
  Serial.println("SoftAP start failed");
}
*/

// 3. Add static IP configuration
IPAddress local_IP(192, 168, 1, 100);  // Get from IT
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);
WiFi.config(local_IP, gateway, subnet);
```

### React App Configuration:

```typescript
// Environment variables (.env.production)
REACT_APP_WS_URL=wss://your-company-domain.com/ws
GENERATE_SOURCEMAP=false
```

## Troubleshooting

### ESP32 Connection Issues:
```bash
# Check if ESP32 is reachable
ping ESP32_IP_ADDRESS

# Test WebSocket connection
wscat -c ws://ESP32_IP:81

# Check serial output for errors
# Open Arduino IDE Serial Monitor (115200 baud)
```

### Dashboard Shows "Disconnected":
1. Verify ESP32 WiFi connection
2. Check ESP32 IP address in serial monitor
3. Test WebSocket URL: `ws://ESP32_IP:81`
4. Check firewall rules
5. Verify network connectivity

### Sensor Reading Problems:
1. Check sensor wiring
2. Verify power supply (3.3V/5V)
3. Test sensors individually
4. Check for loose connections

### Pump Control Issues:
1. Verify motor driver connections
2. Check pump power supply
3. Test pump manually
4. Verify WebSocket message format

## Security Best Practices

### Network Security:
- Use strong WiFi passwords
- Enable WPA3 if available
- Use VPN for remote access
- Regular firmware updates

### Web Security:
- Enable HTTPS with valid SSL certificate
- Use security headers
- Implement CORS policies
- Regular security updates

### Device Security:
- Disable AP mode in production
- Use strong authentication
- Physical security of ESP32
- Regular security audits

## Monitoring & Maintenance

### Health Checks:
```cpp
// Add to ESP32 loop() for monitoring
void checkSystemHealth() {
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 30000) { // Every 30 seconds
    Serial.printf("Uptime: %lu ms, Free heap: %d bytes\n", 
                 millis(), ESP.getFreeHeap());
    lastCheck = millis();
  }
}
```

### Backup Procedures:
```bash
# Backup firmware
cp firmware/farmproject/farmproject.ino backup_$(date +%Y%m%d).ino

# Backup web app
tar -czf farm-manager-backup-$(date +%Y%m%d).tar.gz build/
```

### Update Procedures:
1. Test new firmware in development
2. Backup current configuration
3. Upload new firmware
4. Deploy new web app
5. Verify functionality

## Support Resources

- **ESP32 Documentation**: https://docs.espressif.com/projects/esp-idf/
- **React Documentation**: https://reactjs.org/docs/
- **WebSocket API**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

## Quick Start Commands

```bash
# 1. Build React app
npm install && npm run build

# 2. Deploy to server
sudo cp -r build/* /var/www/farm-manager/

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/farm-manager

# 4. Enable site
sudo ln -s /etc/nginx/sites-available/farm-manager /etc/nginx/sites-enabled/

# 5. Test configuration
sudo nginx -t

# 6. Restart Nginx
sudo systemctl restart nginx

# 7. Get SSL certificate
sudo certbot --nginx -d your-company-domain.com
```

## Summary: Files to Modify

### 1. ESP32 Firmware
- **File**: `firmware/farmproject/farmproject.ino`
- **OR use**: `firmware/farmproject/farmproject_production.ino` (pre-configured)
- **Changes**: WiFi credentials, disable AP mode, add static IP

### 2. React App
- **File**: `src/hooks/useFarmSocket.ts` (line 139)
- **File**: Create `.env.production`
- **Changes**: Update WebSocket URL to HTTPS

### 3. Server Configuration
- **File**: `/etc/nginx/sites-available/farm-manager`
- **Changes**: WebSocket proxy configuration

### 4. Domain Setup
- **DNS**: Point domain to server IP
- **SSL**: Get certificate with `certbot --nginx -d your-domain.com`

**That's it!** Your Farm Manager system should now be accessible at `https://your-company-domain.com`

## Quick Copy-Paste Commands

```bash
# 1. Update ESP32 WiFi credentials
# Edit firmware/farmproject/farmproject.ino lines 22-23

# 2. Create production environment file
echo "REACT_APP_WS_URL=wss://your-company-domain.com/ws" > .env.production
echo "GENERATE_SOURCEMAP=false" >> .env.production

# 3. Build and deploy React app
npm run build
sudo cp -r build/* /var/www/farm-manager/

# 4. Configure Nginx
sudo nano /etc/nginx/sites-available/farm-manager
# Copy the nginx configuration from above

# 5. Enable site and get SSL
sudo ln -s /etc/nginx/sites-available/farm-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-company-domain.com
```