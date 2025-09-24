#!/bin/bash

# Farm Manager Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

# Configuration - UPDATE THESE VALUES
DOMAIN="your-company-domain.com"
ESP32_IP="192.168.1.100"
WEB_ROOT="/var/www/farm-manager"
NGINX_SITE="farm-manager"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 Farm Manager Production Deployment${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if domain is configured
if [ "$DOMAIN" = "your-company-domain.com" ]; then
    print_error "Please update the DOMAIN variable in this script with your actual domain"
    exit 1
fi

# Check if ESP32 IP is configured
if [ "$ESP32_IP" = "192.168.1.100" ]; then
    print_warning "Please update the ESP32_IP variable in this script with your ESP32's actual IP"
fi

echo -e "${BLUE}Step 1: Building React Application${NC}"
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Create production environment file
print_status "Creating production environment file..."
cp production.env .env.production
sed -i "s/your-company-domain.com/$DOMAIN/g" .env.production

# Build the application
print_status "Building React application for production..."
npm run build

if [ ! -d "build" ]; then
    print_error "Build failed - build directory not found"
    exit 1
fi

print_status "React application built successfully"

echo -e "${BLUE}Step 2: Deploying to Web Server${NC}"

# Create web directory if it doesn't exist
sudo mkdir -p $WEB_ROOT

# Copy build files
print_status "Copying build files to web server..."
sudo cp -r build/* $WEB_ROOT/
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

print_status "Files deployed to web server"

echo -e "${BLUE}Step 3: Configuring Nginx${NC}"

# Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo cp nginx_production.conf /etc/nginx/sites-available/$NGINX_SITE

# Update domain and ESP32 IP in Nginx config
sudo sed -i "s/your-company-domain.com/$DOMAIN/g" /etc/nginx/sites-available/$NGINX_SITE
sudo sed -i "s/192.168.1.100/$ESP32_IP/g" /etc/nginx/sites-available/$NGINX_SITE

# Enable the site
print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/

# Test Nginx configuration
print_status "Testing Nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Reload Nginx
print_status "Reloading Nginx..."
sudo systemctl reload nginx

print_status "Nginx configured and reloaded"

echo -e "${BLUE}Step 4: Setting up SSL Certificate${NC}"

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    print_warning "Certbot not found. Installing..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Get SSL certificate
print_status "Obtaining SSL certificate..."
if sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN; then
    print_status "SSL certificate obtained successfully"
else
    print_warning "SSL certificate setup failed. You may need to configure it manually."
fi

echo -e "${BLUE}Step 5: Final Configuration${NC}"

# Update React app to use production WebSocket hook
print_status "Updating React app to use production configuration..."
if [ -f "src/hooks/useFarmSocket_production.ts" ]; then
    cp src/hooks/useFarmSocket_production.ts src/hooks/useFarmSocket.ts
    print_status "Production WebSocket configuration applied"
fi

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/farm-manager > /dev/null <<EOF
$WEB_ROOT/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF

echo -e "${BLUE}Step 6: Verification${NC}"

# Test HTTP connection
print_status "Testing HTTP connection..."
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200"; then
    print_status "HTTP connection successful"
else
    print_warning "HTTP connection test failed"
fi

# Test HTTPS connection
print_status "Testing HTTPS connection..."
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
    print_status "HTTPS connection successful"
else
    print_warning "HTTPS connection test failed"
fi

# Test WebSocket connection
print_status "Testing WebSocket connection..."
if command -v wscat &> /dev/null; then
    if timeout 5 wscat -c wss://$DOMAIN/ws --no-color 2>/dev/null | grep -q "connected"; then
        print_status "WebSocket connection successful"
    else
        print_warning "WebSocket connection test failed"
    fi
else
    print_warning "wscat not installed - skipping WebSocket test"
fi

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Your Farm Manager is now available at:${NC}"
echo -e "  🌐 HTTP:  http://$DOMAIN"
echo -e "  🔒 HTTPS: https://$DOMAIN"
echo -e "  📡 WebSocket: wss://$DOMAIN/ws"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Update ESP32 firmware with production configuration"
echo -e "  2. Configure ESP32 with static IP: $ESP32_IP"
echo -e "  3. Test all sensor readings and pump control"
echo -e "  4. Set up monitoring and alerts"
echo ""
echo -e "${YELLOW}ESP32 Configuration:${NC}"
echo -e "  - Use firmware: firmware/farmproject/farmproject_production.ino"
echo -e "  - Update WiFi credentials in the firmware"
echo -e "  - Set static IP to: $ESP32_IP"
echo -e "  - Upload to ESP32 via Arduino IDE"
echo ""
echo -e "${BLUE}For troubleshooting, check:${NC}"
echo -e "  - Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo -e "  - Application logs: sudo tail -f $WEB_ROOT/logs/*.log"
echo -e "  - ESP32 serial output: Arduino IDE Serial Monitor"

