import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

// Tank configuration - adjust these values for your setup
const TANK_CONFIG = {
  heightCm: 17.0, // Tank height in cm
  emptyDistanceCm: 17.0, // Distance when tank is empty (usually same as height)
  fullDistanceCm: 2.0, // Distance when tank is full (sensor offset from water surface)
};

// Function to calculate tank level percentage from distance
function calculateTankLevel(distanceCm: number): number {
  if (!isFinite(distanceCm) || distanceCm < 0) return 0;
  
  // Inverted calculation: smaller distance = more water = higher percentage
  const range = TANK_CONFIG.emptyDistanceCm - TANK_CONFIG.fullDistanceCm;
  const currentRange = TANK_CONFIG.emptyDistanceCm - distanceCm;
  
  let percentage = (currentRange / range) * 100;
  
  // Clamp to 0-100%
  percentage = Math.max(0, Math.min(100, percentage));
  
  return percentage;
}

export type FarmReading = {
  timestamp: number; // epoch ms
  temperatureC?: number;
  humidityPct?: number;
  moisturePct?: number;
  tankDistanceCm?: number; // Raw distance from ultrasonic sensor
  pumpOn?: boolean;
  // Multi-field support - field1 uses ESP32 data, others calculated
  fields: {
    field1: { moisturePct: number; temperatureC: number; humidityPct: number };
    field2: { moisturePct: number; temperatureC: number; humidityPct: number };
    field3: { moisturePct: number; temperatureC: number; humidityPct: number };
    field4: { moisturePct: number; temperatureC: number; humidityPct: number };
  };
  // Multi-tank support - tank1 uses ESP32 data, others calculated
  tanks: {
    tank1: { levelPct: number; capacity: number };
    tank2: { levelPct: number; capacity: number };
    tank3: { levelPct: number; capacity: number };
  };
};

export type FarmSocketState = {
  isConnected: boolean;
  latest: FarmReading | null;
  temperatureSeries: Array<{ t: number; v: number }>;
  humiditySeries: Array<{ t: number; v: number }>;
  moistureSeries: Array<{ t: number; v: number }>;
  tankLevelSeries: Array<{ t: number; v: number }>;
  // Remove daily data since we're using minute-by-minute
};

const MAX_POINTS = 1440; // keep roughly last 24 hours of minute-by-minute data

function coerceNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isFinite(n) ? n : undefined;
}

function mapIncomingToReading(data: any): FarmReading {
  const now = Date.now();
  
  // Map ESP32 firmware data exactly as sent - this is our PRIMARY data source
  const temperatureC = coerceNumber(data?.temperatureC);
  const humidityPct = coerceNumber(data?.humidityPct);
  const moisturePct = coerceNumber(data?.moisturePct);
  const tankDistanceCm = coerceNumber(data?.tankDistanceCm);
  
  // Get pump status from ESP32 data
  const pumpOn = data?.pumpOn ?? false;

  // ESP32 doesn't send timestamp, so use current time
  const timestamp = now;

  // Field 1 uses ESP32 data directly, others are calculated variations
  const fields = {
    field1: { 
      moisturePct: moisturePct || 50, // PRIMARY: Direct from ESP32
      temperatureC: temperatureC || 25, // PRIMARY: Direct from ESP32
      humidityPct: humidityPct || 60 // PRIMARY: Direct from ESP32
    },
    field2: { 
      moisturePct: (moisturePct || 50) * 1.2, // Calculated: 20% higher
      temperatureC: (temperatureC || 25) * 0.9, // Calculated: 10% lower
      humidityPct: (humidityPct || 60) * 1.1 // Calculated: 10% higher
    },
    field3: { 
      moisturePct: (moisturePct || 50) * 0.7, // Calculated: 30% lower
      temperatureC: (temperatureC || 25) * 1.3, // Calculated: 30% higher
      humidityPct: (humidityPct || 60) * 0.8 // Calculated: 20% lower
    },
    field4: { 
      moisturePct: (moisturePct || 50) * 1.1, // Calculated: 10% higher
      temperatureC: (temperatureC || 25) * 0.8, // Calculated: 20% lower
      humidityPct: (humidityPct || 60) * 1.2 // Calculated: 20% higher
    }
  };

  // Tank 1 uses ESP32 data directly, others are calculated variations
  const tanks = {
    tank1: { levelPct: tankDistanceCm !== undefined ? calculateTankLevel(tankDistanceCm) : 50, capacity: 1000 }, // PRIMARY: Direct from ESP32
    tank2: { levelPct: (tankDistanceCm !== undefined ? calculateTankLevel(tankDistanceCm) : 50) * 1.1, capacity: 1500 }, // Calculated: 10% higher
    tank3: { levelPct: (tankDistanceCm !== undefined ? calculateTankLevel(tankDistanceCm) : 50) * 0.8, capacity: 800 } // Calculated: 20% lower
  };

  return { 
    timestamp, 
    temperatureC, 
    humidityPct, 
    moisturePct, 
    tankDistanceCm, 
    pumpOn,
    fields,
    tanks
  };
}

function readWsUrl(initialUrl?: string): string {
  // Priority: prop > ?ws=<url> query param > localStorage > env > default
  if (initialUrl) return initialUrl;
  
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('ws');
    if (fromQuery) return fromQuery;
  } catch {}
  
  try {
    const fromLs = window.localStorage.getItem('farm_ws_url');
    if (fromLs) return fromLs;
  } catch {}
  
  return (process.env.REACT_APP_WS_URL as string) || 'ws://farm.local:81';
}

// Utility function to clear stored WebSocket URL
export function clearStoredWsUrl(): void {
  try {
    window.localStorage.removeItem('farm_ws_url');
    console.log('[FarmSocket] Cleared stored WebSocket URL');
  } catch (e) {
    console.error('[FarmSocket] Failed to clear stored URL:', e);
  }
}

export function useFarmSocket(url?: string): FarmSocketState & { sendPumpCommand: (command: 'start' | 'stop', duration?: number) => void } {
  const wsUrl = useMemo(() => readWsUrl(url), [url]);
  const [isConnected, setIsConnected] = useState(false);
  const [latest, setLatest] = useState<FarmReading | null>(null);
  const [temperatureSeries, setTemperatureSeries] = useState<Array<{ t: number; v: number }>>([]);
  const [humiditySeries, setHumiditySeries] = useState<Array<{ t: number; v: number }>>([]);
  const [moistureSeries, setMoistureSeries] = useState<Array<{ t: number; v: number }>>([]);
  const [tankLevelSeries, setTankLevelSeries] = useState<Array<{ t: number; v: number }>>([]);
  
  // Remove daily data storage since we're using minute-by-minute
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  // Debug: Log the URL being used
  useEffect(() => {
    console.log('[FarmSocket] Using WebSocket URL:', wsUrl);
    console.log('[FarmSocket] To override, use: ?ws=ws://localhost:8080 or clear localStorage with: localStorage.removeItem("farm_ws_url")');
  }, [wsUrl]);

  useEffect(() => {
    function connect() {
      try {
        // Log the URL we're attempting
        try { console.log('[FarmSocket] connecting to', wsUrl); } catch {}
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const parsed = JSON.parse(String(event.data));
            console.log('[FarmSocket] Raw ESP32 data:', parsed);
            const reading = mapIncomingToReading(parsed);
            console.log('[FarmSocket] Processed reading:', reading);
            setLatest(reading);

            // Update minute-by-minute time series (using ESP32 data directly)
            if (reading.temperatureC !== undefined) {
              setTemperatureSeries(prev => {
                const next = [...prev, { t: reading.timestamp, v: reading.temperatureC as number }];
                return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
              });
            }
            if (reading.humidityPct !== undefined) {
              setHumiditySeries(prev => {
                const next = [...prev, { t: reading.timestamp, v: reading.humidityPct as number }];
                return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
              });
            }
            if (reading.moisturePct !== undefined) {
              setMoistureSeries(prev => {
                const next = [...prev, { t: reading.timestamp, v: reading.moisturePct as number }];
                return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
              });
            }
            if (reading.tankDistanceCm !== undefined) {
              setTankLevelSeries(prev => {
                const next = [...prev, { t: reading.timestamp, v: reading.tankDistanceCm as number }];
                return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
              });
            }
          } catch (e) {
            // Ignore malformed messages
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Attempt reconnection after a short delay
          if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
          reconnectTimer.current = window.setTimeout(() => {
            connect();
          }, 2000);
        };

        ws.onerror = (evt) => {
          try { console.error('[FarmSocket] websocket error', evt); } catch {}
          try { ws.close(); } catch {}
        };
      } catch (err) {
        // Try again soon
        if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = window.setTimeout(() => connect(), 2000);
      }
    }

    connect();
    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
    };
  }, [wsUrl]);

  // Function to send pump commands
  const sendPumpCommand = useCallback((command: 'start' | 'stop', duration?: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      let message: string;
      if (command === 'start') {
        // For manual control, don't send duration (or send 0)
        if (duration === undefined) {
          message = JSON.stringify({
            pump: command
          });
        } else {
          message = JSON.stringify({
            pump: command,
            duration: duration
          });
        }
      } else {
        message = JSON.stringify({
          pump: command
        });
      }
      wsRef.current.send(message);
      console.log('[FarmSocket] Sent pump command:', message);
    } else {
      console.warn('[FarmSocket] Cannot send pump command: WebSocket not connected');
    }
  }, []);

  return { 
    isConnected, 
    latest, 
    temperatureSeries, 
    humiditySeries, 
    moistureSeries, 
    tankLevelSeries,
    sendPumpCommand
  };
}