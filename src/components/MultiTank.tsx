import React from 'react';

type TankData = {
  levelPct: number;
  capacity: number;
};

type MultiTankProps = {
  tanks: {
    tank1: TankData;
    tank2: TankData;
    tank3: TankData;
  };
};

export const MultiTank: React.FC<MultiTankProps> = ({ tanks }) => {
  const tankNames = {
    tank1: 'Main Tank',
    tank2: 'Reserve Tank', 
    tank3: 'Backup Tank'
  };

  const tankColors = {
    tank1: '#2563eb', // Blue - ESP32 data
    tank2: '#059669', // Green - Calculated
    tank3: '#d97706'  // Orange - Calculated
  };

  const tankStatus = {
    tank1: { status: 'Active', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
    tank2: { status: 'Active', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
    tank3: { status: 'Active', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' }
  };

  const getTankStatus = (levelPct: number) => {
    if (levelPct > 70) return { status: 'Full', color: '#059669' };
    if (levelPct > 30) return { status: 'Good', color: '#d97706' };
    return { status: 'Low', color: '#dc2626' };
  };

  const formatCapacity = (capacity: number) => {
    if (capacity >= 1000) return `${(capacity / 1000).toFixed(2)}k L`;
    return `${capacity.toFixed(2)} L`;
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      borderRadius: '12px', 
      padding: '20px',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        color: '#1e293b', 
        margin: '0 0 20px 0',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        💧 Multi-Tank Water System
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {Object.entries(tanks).map(([tankKey, tankData]) => {
          const status = getTankStatus(tankData.levelPct);
          const tankInfo = tankStatus[tankKey as keyof typeof tankStatus];
          const isESP32 = tankKey === 'tank1';
          
          return (
            <div key={tankKey} style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${tankColors[tankKey as keyof typeof tankColors]}`,
              position: 'relative',
              overflow: 'hidden',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column'
            }}>

              
              <div style={{ 
                color: tankColors[tankKey as keyof typeof tankColors], 
                fontWeight: 'bold', 
                fontSize: '16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>

                {tankNames[tankKey as keyof typeof tankNames]}
              </div>
              
              {/* Tank Level Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  <span>Level</span>
                  <span style={{ color: '#1e293b', fontWeight: '600' }}>
                    {tankData.levelPct.toFixed(2)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '24px',
                  background: 'rgba(241, 245, 249, 0.8)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(148, 163, 184, 0.2)'
                }}>
                  <div style={{
                    width: `${tankData.levelPct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${tankColors[tankKey as keyof typeof tankColors]}, ${tankColors[tankKey as keyof typeof tankColors]}80)`,
                    borderRadius: '12px',
                    transition: 'width 0.5s ease',
                    boxShadow: `0 0 8px ${tankColors[tankKey as keyof typeof tankColors]}40`
                  }} />
                </div>
              </div>
              
              {/* Tank Details */}
              <div style={{ 
                fontSize: '13px', 
                color: '#64748b',
                lineHeight: '1.6',
                marginTop: 'auto'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px' 
                }}>
                  <span>Capacity:</span>
                  <span style={{ color: '#1e293b', fontWeight: '600' }}>
                    {formatCapacity(tankData.capacity)}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '6px' 
                }}>
                  <span>Current:</span>
                  <span style={{ color: '#1e293b', fontWeight: '600' }}>
                    {formatCapacity((tankData.levelPct / 100) * tankData.capacity)}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '12px',
                  marginBottom: '8px'
                }}>
                  <span>Status:</span>
                  <span style={{ 
                    color: status.color, 
                    fontWeight: '600',
                    fontSize: '12px',
                    padding: '4px 8px',
                    background: `${status.color}20`,
                    borderRadius: '6px',
                    border: `1px solid ${status.color}40`
                  }}>
                    {status.status}
                  </span>
                </div>
              </div>
              
              {/* Data source indicator */}
              <div style={{
                background: tankInfo.bg,
                border: `1px solid ${tankInfo.color}`,
                borderRadius: '8px',
                padding: '6px 10px',
                textAlign: 'center',
                marginTop: '12px'
              }}>
                <span style={{ 
                  color: tankInfo.color, 
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {tankInfo.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* System Overview */}
      <div style={{ 
        marginTop: '24px', 
        padding: '24px', 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
        borderRadius: '16px',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h4 style={{ 
          color: '#1e293b', 
          margin: '0 0 20px 0', 
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 System Overview
        </h4>
        
        {/* Main Stats Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#1e40af',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total Capacity
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700',
              color: '#1e40af'
            }}>
              {formatCapacity(Number(Object.values(tanks).reduce((sum, tank) => sum + tank.capacity, 0).toFixed(2)))}
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#15803d',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Current Water
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700',
              color: '#15803d'
            }}>
              {formatCapacity(
                Number(Object.values(tanks).reduce((sum, tank) => 
                  sum + ((tank.levelPct / 100) * tank.capacity), 0
                ).toFixed(2))
              )}
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#d97706',
              fontWeight: '600',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              System Fill
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700',
              color: '#d97706'
            }}>
              {Number((
                Object.values(tanks).reduce((sum, tank) => 
                  sum + ((tank.levelPct / 100) * tank.capacity), 0
                ) / Object.values(tanks).reduce((sum, tank) => sum + tank.capacity, 0) * 100
              ).toFixed(2))}%
            </div>
          </div>
        </div>
        
        {/* System Status Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '8px',
            fontSize: '13px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            <span>Overall System Level</span>
            <span style={{ color: '#1e293b', fontWeight: '600' }}>
              {Number((
                Object.values(tanks).reduce((sum, tank) => 
                  sum + ((tank.levelPct / 100) * tank.capacity), 0
                ) / Object.values(tanks).reduce((sum, tank) => sum + tank.capacity, 0) * 100
              ).toFixed(2))}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: 'rgba(241, 245, 249, 0.8)',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <div style={{
              width: `${(
                Object.values(tanks).reduce((sum, tank) => 
                  sum + ((tank.levelPct / 100) * tank.capacity), 0
                ) / Object.values(tanks).reduce((sum, tank) => sum + tank.capacity, 0) * 100
              )}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              borderRadius: '6px',
              transition: 'width 0.5s ease',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)'
            }} />
          </div>
        </div>
        
        {/* Tank Status Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          {Object.entries(tanks).map(([tankKey, tankData]) => {
            const status = getTankStatus(tankData.levelPct);
            return (
              <div key={tankKey} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(248, 250, 252, 0.8)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  {tankNames[tankKey as keyof typeof tankNames]}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: status.color,
                  fontWeight: '600',
                  padding: '2px 6px',
                  background: `${status.color}15`,
                  borderRadius: '4px'
                                 }}>
                   {tankData.levelPct.toFixed(2)}%
                 </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
