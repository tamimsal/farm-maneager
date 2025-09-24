// ESP32 Smart Farm firmware: PRODUCTION VERSION
// Features: WebSocket server broadcasting JSON sensor data + pump control
// PRODUCTION: AP mode disabled, static IP configured

#include <WiFi.h>
#include <WebSocketsServer.h> // Install "arduinoWebSockets" by Markus Sattler (Links2004)
#include <WebServer.h>
#include <ESPmDNS.h>
#include "DHT.h"

#define DHTTYPE DHT11
#define DHTPIN 27
#define TRIGPIN 25
#define ECHOPIN 14
#define SOUND_SPEED 0.034f
#define SOILMOISTUREPIN 34

// Pump motor driver pins
#define PUMP_IN1 32
#define PUMP_IN2 35

// PRODUCTION: Update these with your company WiFi credentials
const char* WIFI_SSID = "YOUR_COMPANY_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_COMPANY_WIFI_PASSWORD";

// PRODUCTION: Static IP configuration (coordinate with IT department)
IPAddress local_IP(192, 168, 1, 100);  // Change this IP
IPAddress gateway(192, 168, 1, 1);     // Change gateway
IPAddress subnet(255, 255, 255, 0);    // Change subnet
IPAddress primaryDNS(8, 8, 8, 8);
IPAddress secondaryDNS(8, 8, 4, 4);

// Tank height (cm) used to compute percentage from ultrasonic distance
const float TANK_HEIGHT_CM = 17.0f;

DHT dht(DHTPIN, DHTTYPE);
WebSocketsServer webSocket = WebSocketsServer(81);
WebServer httpServer(80);

unsigned long lastBroadcastMs = 0;
String lastJson = "{}";

// Pump control variables
bool pumpRunning = false;
unsigned long pumpStartTime = 0;
unsigned long pumpDuration = 0; // in milliseconds
bool pumpScheduled = false;

static float clampFloat(float v, float lo, float hi) {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

// Pump control functions
void startPump(unsigned long durationMs) {
  Serial.printf("[PUMP] Starting pump - IN1: HIGH, IN2: LOW, Duration: %lu ms\n", durationMs);
  digitalWrite(PUMP_IN1, HIGH);
  digitalWrite(PUMP_IN2, LOW);
  pumpRunning = true;
  pumpStartTime = millis();
  pumpDuration = durationMs;
  if (durationMs == 0) {
    Serial.println("[PUMP] Started (manual control - will run until stopped)");
  } else {
    Serial.printf("[PUMP] Started for %lu ms (auto-stop enabled)\n", durationMs);
  }
}

void stopPump() {
  Serial.println("[PUMP] Stopping pump - IN1: LOW, IN2: LOW");
  digitalWrite(PUMP_IN1, LOW);
  digitalWrite(PUMP_IN2, LOW);
  pumpRunning = false;
  Serial.println("[PUMP] Stopped");
}

void updatePump() {
  // Only auto-stop if duration > 0 (not manual control)
  if (pumpRunning && pumpDuration > 0 && (millis() - pumpStartTime >= pumpDuration)) {
    stopPump();
  }
}

void handleWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[WS] Client %u connected from %s\n", num, ip.toString().c_str());
      break;
    }
    case WStype_DISCONNECTED:
      Serial.printf("[WS] Client %u disconnected\n", num);
      break;
    case WStype_TEXT: {
      // Handle pump control commands
      String message = String((char*)payload);
      Serial.printf("[WS] Received: %s\n", message.c_str());
      
      // Parse JSON command properly
      if (message.indexOf("\"pump\"") != -1) {
        if (message.indexOf("\"start\"") != -1) {
          Serial.println("[WS] Start pump command detected");
          // Check if duration is specified
          int durationIndex = message.indexOf("\"duration\"");
          if (durationIndex != -1) {
            // Extract duration value
            int colonIndex = message.indexOf(":", durationIndex);
            int commaIndex = message.indexOf(",", colonIndex);
            int braceIndex = message.indexOf("}", colonIndex);
            int endIndex = (commaIndex != -1 && commaIndex < braceIndex) ? commaIndex : braceIndex;
            
            if (colonIndex != -1 && endIndex != -1) {
              String durationStr = message.substring(colonIndex + 1, endIndex);
              durationStr.trim();
              unsigned long duration = durationStr.toInt() * 1000; // Convert seconds to milliseconds
              Serial.printf("[WS] Starting pump for %lu ms\n", duration);
              startPump(duration);
            } else {
              Serial.println("[WS] Invalid duration format, using manual control");
              startPump(0); // Manual control
            }
          } else {
            Serial.println("[WS] No duration specified, using manual control");
            startPump(0); // 0 duration = manual control (no auto-stop)
          }
        } else if (message.indexOf("\"stop\"") != -1) {
          Serial.println("[WS] Stop pump command detected");
          stopPump();
        }
      } else {
        Serial.println("[WS] No pump command found in message");
      }
      break;
    }
    default:
      break;
  }
}

void connectWifi() {
  Serial.printf("Connecting to Wi‑Fi SSID '%s'...\n", WIFI_SSID);
  WiFi.persistent(false);
  WiFi.setSleep(false); // improve stability
  
  // PRODUCTION: Station mode only, no AP
  WiFi.mode(WIFI_STA);

  // PRODUCTION: Configure static IP
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("STA Failed to configure static IP");
  }

  // Connect to company WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(300);
    Serial.print('.');
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi‑Fi connected (STA)");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWi‑Fi STA connect timeout");
  }
}

long duration;
float distanceCm;
unsigned long lastValidReading = 0;
float lastValidDistance = 0;
int consecutiveErrors = 0;
const int MAX_CONSECUTIVE_ERRORS = 5;

// Function to read ultrasonic sensor with error handling
float readUltrasonicSensor() {
  // Multiple readings for reliability
  float readings[3];
  int validReadings = 0;
  
  for (int i = 0; i < 3; i++) {
    // Clear trigger
    digitalWrite(TRIGPIN, LOW);
    delayMicroseconds(2);
    
    // Send trigger pulse
    digitalWrite(TRIGPIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIGPIN, LOW);
    
    // Read echo
    long duration = pulseIn(ECHOPIN, HIGH, 30000); // 30ms timeout
    
    if (duration > 0) {
      float distance = duration * SOUND_SPEED / 2.0f;
      
      // Validate distance (reasonable range for tank)
      if (distance > 0 && distance < 100) { // Max 100cm tank
        readings[validReadings] = distance;
        validReadings++;
      }
    }
    
    delay(10); // Small delay between readings
  }
  
  if (validReadings > 0) {
    // Use median reading for stability
    float medianDistance;
    if (validReadings == 1) {
      medianDistance = readings[0];
    } else if (validReadings == 2) {
      medianDistance = (readings[0] + readings[1]) / 2.0f;
    } else {
      // Sort and get median (manual swap)
      float temp;
      if (readings[0] > readings[1]) {
        temp = readings[0]; readings[0] = readings[1]; readings[1] = temp;
      }
      if (readings[1] > readings[2]) {
        temp = readings[1]; readings[1] = readings[2]; readings[2] = temp;
      }
      if (readings[0] > readings[1]) {
        temp = readings[0]; readings[0] = readings[1]; readings[1] = temp;
      }
      medianDistance = readings[1];
    }
    
    lastValidDistance = medianDistance;
    lastValidReading = millis();
    consecutiveErrors = 0;
    
    return medianDistance;
  } else {
    consecutiveErrors++;
    
    // If we have a recent valid reading, use it temporarily
    if (lastValidReading > 0 && (millis() - lastValidReading) < 30000) { // 30 seconds
      return lastValidDistance;
    }
    
    return NAN;
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);

  dht.begin();
  pinMode(TRIGPIN, OUTPUT);
  pinMode(ECHOPIN, INPUT);
  pinMode(SOILMOISTUREPIN, INPUT);
  
  // Initialize pump motor driver pins
  pinMode(PUMP_IN1, OUTPUT);
  pinMode(PUMP_IN2, OUTPUT);
  digitalWrite(PUMP_IN1, LOW);
  digitalWrite(PUMP_IN2, LOW);
  
  // Test pump pins on startup
  Serial.println("[PUMP] Testing pump pins...");
  Serial.printf("[PUMP] IN1 pin: %d, IN2 pin: %d\n", PUMP_IN1, PUMP_IN2);
  Serial.println("[PUMP] Initial state: IN1=LOW, IN2=LOW");

  connectWifi();

  webSocket.begin();
  webSocket.onEvent(handleWebSocketEvent);
  Serial.println("WebSocket server started on ws://<this-ip>:81/");

  // Minimal HTTP server for health checks and latest metrics
  httpServer.on("/", [](){
    httpServer.send(200, "text/plain", "ESP32 Smart Farm — OK\n/health, /metrics available");
  });
  httpServer.on("/health", [](){
    httpServer.send(200, "application/json", "{\"status\":\"ok\"}");
  });
  httpServer.on("/metrics", [](){
    httpServer.send(200, "application/json", lastJson);
  });

  httpServer.begin();
  Serial.println("HTTP server on http://<this-ip>/");

  // mDNS so you can use farm.local
  if (MDNS.begin("farm")) {
    MDNS.addService("http", "tcp", 80);
    MDNS.addService("ws", "tcp", 81);
    Serial.println("mDNS ready: http://farm.local/  ws://farm.local:81/");
  } else {
    Serial.println("mDNS start failed");
  }
}

void loop() {
  webSocket.loop();
  httpServer.handleClient();
  
  // Update pump status
  updatePump();

  // Read sensors
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  int soilRaw = analogRead(SOILMOISTUREPIN); // 0..4095

  // Use robust ultrasonic reading function
  distanceCm = readUltrasonicSensor();

  // Derived metrics
  // Soil sensors vary; often higher raw => dryer. Invert to get percent moisture.
  float moisturePct = (1.0f - (float)soilRaw / 4095.0f) * 100.0f;
  moisturePct = clampFloat(moisturePct, 0.0f, 100.0f);

  float tankPct = NAN;
  if (isfinite(distanceCm)) {
    tankPct = 100.0f - ((distanceCm / TANK_HEIGHT_CM) * 100.0f);
    tankPct = clampFloat(tankPct, 0.0f, 100.0f);
  }

  // Broadcast every 2 seconds
  unsigned long now = millis();
  if (now - lastBroadcastMs >= 2000) {
    lastBroadcastMs = now;

    // Build JSON (no timestamp; frontend will timestamp on receipt)
    String json = "{";
    if (!isnan(temperature)) {
      json += "\"temperatureC\":" + String(temperature, 2);
    }
    if (!isnan(humidity)) {
      if (json.length() > 1) json += ",";
      json += "\"humidityPct\":" + String(humidity, 2);
    }
    if (isfinite(moisturePct)) {
      if (json.length() > 1) json += ",";
      json += "\"moisturePct\":" + String(moisturePct, 2);
    }
    if (isfinite(distanceCm)) {
      if (json.length() > 1) json += ",";
      json += "\"tankDistanceCm\":" + String(distanceCm, 2);
    }
    // Add pump status
    if (json.length() > 1) json += ",";
    json += "\"pumpOn\":" + String(pumpRunning ? "true" : "false");
    json += "}";

    lastJson = json;
    webSocket.broadcastTXT(lastJson);
  }
}

