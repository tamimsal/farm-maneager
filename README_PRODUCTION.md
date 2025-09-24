# Farm Manager - Production Files

This directory contains production-ready files for deploying the Farm Manager system to a company domain.

## Production Files Overview

### 1. ESP32 Firmware
- **`firmware/farmproject/farmproject_production.ino`** - Production-ready ESP32 firmware
  - AP mode disabled for security
  - Static IP configuration included
  - Company WiFi credentials placeholder
  - All production optimizations applied

### 2. React Application
- **`src/hooks/useFarmSocket_production.ts`** - Production WebSocket hook
  - HTTPS WebSocket URL configured
  - Production logging enabled
  - Enhanced error handling

### 3. Environment Configuration
- **`production.env`** - Production environment variables
  - WebSocket URL for HTTPS
  - Source maps disabled
  - Production optimizations

### 4. Server Configuration
- **`nginx_production.conf`** - Complete Nginx configuration
  - WebSocket proxy setup
  - Security headers
  - SSL ready
  - Static asset caching

### 5. Deployment Automation
- **`deploy_production.sh`** - Automated deployment script
  - Builds React app
  - Configures Nginx
  - Sets up SSL certificate
  - Runs verification tests

## Quick Production Deployment

### Prerequisites
- Ubuntu/Debian server with Nginx
- Domain name pointing to server
- ESP32 with sensors connected
- Company WiFi credentials

### 1. Update Configuration
```bash
# Edit deployment script
nano deploy_production.sh

# Update these variables:
DOMAIN="your-company-domain.com"
ESP32_IP="192.168.1.100"  # Your ESP32's static IP
```

### 2. Update ESP32 Firmware
```bash
# Edit firmware file
nano firmware/farmproject/farmproject_production.ino

# Update these lines:
const char* WIFI_SSID = "YOUR_COMPANY_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_COMPANY_WIFI_PASSWORD";
IPAddress local_IP(192, 168, 1, 100);  # Your ESP32 IP
```

### 3. Run Deployment
```bash
# Make script executable (already done)
chmod +x deploy_production.sh

# Run deployment
./deploy_production.sh
```

### 4. Upload ESP32 Firmware
1. Open Arduino IDE
2. Load `firmware/farmproject/farmproject_production.ino`
3. Update WiFi credentials and IP address
4. Upload to ESP32
5. Check Serial Monitor for connection status

## Manual Deployment Steps

If you prefer manual deployment:

### 1. Build React App
```bash
# Copy environment file
cp production.env .env.production

# Update domain in environment file
sed -i 's/your-company-domain.com/your-actual-domain.com/g' .env.production

# Install dependencies and build
npm install
npm run build
```

### 2. Deploy to Server
```bash
# Create web directory
sudo mkdir -p /var/www/farm-manager

# Copy build files
sudo cp -r build/* /var/www/farm-manager/
sudo chown -R www-data:www-data /var/www/farm-manager
```

### 3. Configure Nginx
```bash
# Copy Nginx configuration
sudo cp nginx_production.conf /etc/nginx/sites-available/farm-manager

# Update domain and ESP32 IP
sudo sed -i 's/your-company-domain.com/your-actual-domain.com/g' /etc/nginx/sites-available/farm-manager
sudo sed -i 's/192.168.1.100/your-esp32-ip/g' /etc/nginx/sites-available/farm-manager

# Enable site
sudo ln -s /etc/nginx/sites-available/farm-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSL
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-actual-domain.com
```

## Production Checklist

### Before Deployment
- [ ] Update domain name in all configuration files
- [ ] Configure ESP32 static IP address
- [ ] Update company WiFi credentials in firmware
- [ ] Test ESP32 firmware in development
- [ ] Verify all sensors are working
- [ ] Test pump control functionality

### After Deployment
- [ ] Verify HTTPS is working
- [ ] Test WebSocket connection
- [ ] Check all sensor readings
- [ ] Test pump start/stop commands
- [ ] Verify dashboard displays correctly
- [ ] Set up monitoring and alerts
- [ ] Document network configuration
- [ ] Create backup procedures

## Security Features

### ESP32 Security
- AP mode disabled
- Static IP configuration
- Secure WiFi connection
- Input validation for pump commands

### Web Security
- HTTPS with SSL certificate
- Security headers (XSS, CSRF protection)
- Content Security Policy
- Sensitive file access blocked
- Gzip compression enabled

### Network Security
- WebSocket over HTTPS (WSS)
- Proxy configuration for ESP32
- Firewall rules for required ports only
- Regular security updates

## Troubleshooting

### Common Issues

**ESP32 Connection Problems:**
```bash
# Check ESP32 IP
ping 192.168.1.100

# Test WebSocket
wscat -c ws://192.168.1.100:81
```

**WebSocket Connection Issues:**
```bash
# Check Nginx proxy
sudo tail -f /var/log/nginx/error.log

# Test WebSocket through proxy
wscat -c wss://your-domain.com/ws
```

**SSL Certificate Issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

### Log Files
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`
- **ESP32 Serial**: Arduino IDE Serial Monitor
- **Application**: `/var/www/farm-manager/logs/`

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review log files
3. Verify network connectivity
4. Test individual components
5. Check ESP32 serial output

## File Structure

```
farm-manager/
├── firmware/
│   └── farmproject/
│       ├── farmproject.ino              # Development version
│       └── farmproject_production.ino   # Production version
├── src/
│   └── hooks/
│       ├── useFarmSocket.ts             # Development version
│       └── useFarmSocket_production.ts  # Production version
├── production.env                       # Environment variables
├── nginx_production.conf               # Nginx configuration
├── deploy_production.sh                # Deployment script
└── README_PRODUCTION.md                # This file
```

All production files are ready to use with minimal configuration required.

