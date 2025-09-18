import React, { useState } from 'react';
import { useFarmSocket } from '../hooks/useFarmSocket';
import { StatCard } from './StatCard';
import { TimeSeriesChart } from './TimeSeriesChart';
import { FieldDashboard } from './FieldDashboard';
import { MultiTank } from './MultiTank';
import { PumpScheduler } from './PumpScheduler';
import { Recommendations } from './Recommendations';

export const Dashboard: React.FC = () => {
  const { isConnected, latest, temperatureSeries, humiditySeries, moistureSeries, tankLevelSeries, sendPumpCommand } = useFarmSocket();
  const [activeTab, setActiveTab] = useState<'overview' | 'tanks' | 'fields'>('overview');

  const latestTemp = latest?.temperatureC;
  const latestHum = latest?.humidityPct;
  const latestMoist = latest?.moisturePct;
  const latestTankDistance = latest?.tankDistanceCm;
  const latestTankLevel = latest?.tanks?.tank1?.levelPct;
  const pumpOn = latest?.pumpOn ?? false;

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    color: isActive ? '#ffffff' : '#374151',
    fontWeight: isActive ? 600 : 500,
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: isActive ? '3px solid #1d4ed8' : '1px solid #d1d5db',
    marginRight: '4px',
    fontSize: '14px'
  });

  const tabContentStyle = {
    background: '#ffffff',
    borderRadius: '0 12px 12px 12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    borderTop: 'none',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              🌱 FarmOS Dashboard
            </h1>
            <p style={{ 
              margin: '8px 0 0 0', 
              color: '#64748b', 
              fontSize: '14px' 
            }}>
              Real-time monitoring and control system
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            background: isConnected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <span style={{ fontSize: '12px' }}>{isConnected ? '●' : '○'}</span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        marginBottom: '0',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button 
          style={tabStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          style={tabStyle(activeTab === 'tanks')}
          onClick={() => setActiveTab('tanks')}
        >
          💧 Tanks & Watering
        </button>
        <button 
          style={tabStyle(activeTab === 'fields')}
          onClick={() => setActiveTab('fields')}
        >
          🌾 Fields Status
        </button>
      </div>

      {/* Tab Content */}
      <div style={tabContentStyle}>
        {activeTab === 'overview' && (
          <div style={{ padding: '0 8px' }}>
            {/* Main Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: 16,
              marginBottom: 20
            }}>
                             <StatCard label="Temperature" value={latestTemp !== undefined ? `${latestTemp.toFixed(2)} °C` : '—'} />
               <StatCard label="Humidity" value={latestHum !== undefined ? `${latestHum.toFixed(2)} %` : '—'} />
               <StatCard label="Soil Moisture" value={latestMoist !== undefined ? `${latestMoist.toFixed(2)} %` : '—'} />
               <StatCard 
                 label="Tank Level" 
                 value={latestTankLevel !== undefined ? `${latestTankLevel.toFixed(2)} %` : '—'} 
                 subtitle={latestTankDistance !== undefined ? `${latestTankDistance.toFixed(2)} cm` : ''} 
               />
               <StatCard 
                 label="Pump Status" 
                 value={pumpOn ? 'ON' : 'OFF'} 
                 subtitle={pumpOn ? 'Running' : 'Stopped'}
                 valueColor={pumpOn ? '#22c55e' : '#ef4444'}
               />
            </div>

            {/* Charts Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 20,
              marginTop: 20,
              marginBottom: 20
            }}>
              <TimeSeriesChart 
                data={temperatureSeries} 
                label="Temperature (°C)" 
                color="#ef4444"
              />
              <TimeSeriesChart 
                data={humiditySeries} 
                label="Humidity (%)" 
                color="#3b82f6"
              />
              <TimeSeriesChart 
                data={moistureSeries} 
                label="Soil Moisture (%)" 
                color="#10b981"
              />
              <TimeSeriesChart 
                data={tankLevelSeries} 
                label="Tank Level (%)" 
                color="#8b5cf6"
                yDomain={[0, 100]}
              />
            </div>
            <div style={{ marginTop: '24px' }}>
              <Recommendations 
                temperatureC={latestTemp}
                humidityPct={latestHum}
                moisturePct={latestMoist}
                tankLevelPct={latestTankLevel}
              />
            </div>
          </div>
        )}

                 {activeTab === 'tanks' && (
           <div style={{ padding: '0 8px' }}>
             {latest?.tanks && <MultiTank tanks={latest.tanks} />}
             
             {/* Pump Control Section */}
             <div style={{
               background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
               borderRadius: '12px',
               padding: '20px',
               marginTop: '20px',
               border: '1px solid rgba(148, 163, 184, 0.2)',
               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
             }}>
               <h3 style={{
                 color: '#1e293b',
                 margin: '0 0 16px 0',
                 fontSize: '18px',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '8px'
               }}>
                 💧 Pump Control
               </h3>
               
               <div style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '16px',
                 marginBottom: '16px'
               }}>
                 <div style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '8px',
                   padding: '8px 16px',
                   borderRadius: '8px',
                   background: pumpOn ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                   border: `1px solid ${pumpOn ? '#22c55e' : '#ef4444'}`
                 }}>
                   <span style={{ fontSize: '16px' }}>{pumpOn ? '🟢' : '🔴'}</span>
                   <span style={{
                     fontSize: '14px',
                     fontWeight: '600',
                     color: pumpOn ? '#22c55e' : '#ef4444'
                   }}>
                     Pump {pumpOn ? 'ON' : 'OFF'}
                   </span>
                 </div>
                 
                 <div style={{ fontSize: '12px', color: '#64748b' }}>
                   {pumpOn ? 'Water pump is currently running' : 'Water pump is stopped'}
                 </div>
               </div>
               
               <div style={{
                 display: 'flex',
                 gap: '12px',
                 flexWrap: 'wrap'
               }}>
                 <button
                   onClick={() => sendPumpCommand('start')}
                   disabled={!isConnected || pumpOn}
                   style={{
                     padding: '12px 24px',
                     borderRadius: '8px',
                     border: 'none',
                     background: pumpOn || !isConnected 
                       ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                       : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                     color: '#ffffff',
                     fontSize: '14px',
                     fontWeight: '600',
                     cursor: pumpOn || !isConnected ? 'not-allowed' : 'pointer',
                     transition: 'all 0.2s ease',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px'
                   }}
                 >
                   ▶️ Start Pump
                 </button>
                 
                 <button
                   onClick={() => sendPumpCommand('stop')}
                   disabled={!isConnected || !pumpOn}
                   style={{
                     padding: '12px 24px',
                     borderRadius: '8px',
                     border: 'none',
                     background: !pumpOn || !isConnected 
                       ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                       : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                     color: '#ffffff',
                     fontSize: '14px',
                     fontWeight: '600',
                     cursor: !pumpOn || !isConnected ? 'not-allowed' : 'pointer',
                     transition: 'all 0.2s ease',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px'
                   }}
                 >
                   ⏹️ Stop Pump
                 </button>
               </div>
               
               {!isConnected && (
                 <div style={{
                   marginTop: '12px',
                   padding: '8px 12px',
                   background: 'rgba(239, 68, 68, 0.1)',
                   border: '1px solid #ef4444',
                   borderRadius: '6px',
                   fontSize: '12px',
                   color: '#ef4444'
                 }}>
                   ⚠️ Cannot control pump: WebSocket disconnected
                 </div>
               )}
             </div>
             
             <div style={{ marginTop: '24px' }}>
               <Recommendations 
                 temperatureC={latestTemp}
                 humidityPct={latestHum}
                 moisturePct={latestMoist}
                 tankLevelPct={latestTankLevel}
               />
             </div>
             <div style={{ marginTop: '24px' }}>
               <PumpScheduler />
             </div>
           </div>
         )}

         {activeTab === 'fields' && (
           <div style={{ padding: '0 8px' }}>
             {latest?.fields && <FieldDashboard fields={latest.fields} />}
           </div>
         )}
      </div>
    </div>
  );
};


