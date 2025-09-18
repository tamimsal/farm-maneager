import React from 'react';

type FieldData = {
  moisturePct: number;
  temperatureC: number;
  humidityPct: number;
};

type FieldDashboardProps = {
  fields: {
    field1: FieldData;
    field2: FieldData;
    field3: FieldData;
    field4: FieldData;
  };
};

type FieldRecommendation = {
  type: 'watering' | 'temperature' | 'humidity' | 'general';
  priority: 'high' | 'medium' | 'low';
  message: string;
  icon: string;
};

export const FieldDashboard: React.FC<FieldDashboardProps> = ({ fields }) => {
  const fieldNames = {
    field1: 'Field 1 - North',
    field2: 'Field 2 - East', 
    field3: 'Field 3 - South',
    field4: 'Field 4 - West'
  };

  const fieldColors = {
    field1: '#059669', // Green
    field2: '#2563eb', // Blue
    field3: '#d97706', // Orange
    field4: '#7c3aed'  // Purple
  };

  const fieldStatus = {
    field1: { status: 'Active', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
    field2: { status: 'Active', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
    field3: { status: 'Active', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
    field4: { status: 'Active', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' }
  };

  const getFieldRecommendations = (fieldData: FieldData): FieldRecommendation[] => {
    const recommendations: FieldRecommendation[] = [];

    // Watering recommendations
    if (fieldData.moisturePct < 15) {
      recommendations.push({
        type: 'watering',
        priority: 'high',
        message: 'Needs immediate watering',
        icon: '💧'
      });
    } else if (fieldData.moisturePct < 20) {
      recommendations.push({
        type: 'watering',
        priority: 'medium',
        message: 'Consider watering soon',
        icon: '🌱'
      });
    } else if (fieldData.moisturePct > 80) {
      recommendations.push({
        type: 'watering',
        priority: 'low',
        message: 'Soil is very moist',
        icon: '🌧️'
      });
    }

    // Temperature recommendations
    if (fieldData.temperatureC > 35) {
      recommendations.push({
        type: 'temperature',
        priority: 'high',
        message: 'Temperature too high',
        icon: '🌡️'
      });
    } else if (fieldData.temperatureC > 30) {
      recommendations.push({
        type: 'temperature',
        priority: 'medium',
        message: 'Monitor temperature',
        icon: '☀️'
      });
    } else if (fieldData.temperatureC < 10) {
      recommendations.push({
        type: 'temperature',
        priority: 'high',
        message: 'Temperature too low',
        icon: '❄️'
      });
    }

    // Humidity recommendations
    if (fieldData.humidityPct > 85) {
      recommendations.push({
        type: 'humidity',
        priority: 'medium',
        message: 'High humidity risk',
        icon: '💨'
      });
    } else if (fieldData.humidityPct < 40) {
      recommendations.push({
        type: 'humidity',
        priority: 'medium',
        message: 'Low humidity',
        icon: '🌵'
      });
    }

    // Optimal conditions
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'general',
        priority: 'low',
        message: 'Optimal conditions',
        icon: '✅'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
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
        🌾 Multi-Field Overview
      </h3>
      
      {/* Field Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {Object.entries(fields).map(([fieldKey, fieldData]) => {
          const status = fieldStatus[fieldKey as keyof typeof fieldStatus];
          const recommendations = getFieldRecommendations(fieldData);
          const topRecommendation = recommendations[0];
          
          return (
            <div key={fieldKey} style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${fieldColors[fieldKey as keyof typeof fieldColors]}`,
              position: 'relative',
              overflow: 'hidden',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              <div style={{ 
                color: fieldColors[fieldKey as keyof typeof fieldColors], 
                fontWeight: 'bold', 
                fontSize: '16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {fieldNames[fieldKey as keyof typeof fieldNames]}
              </div>

              {/* Field Data */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '60px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>🌡️</div>
                    <div>Temp</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.2' }}>
                    {fieldData.temperatureC.toFixed(2)}°C
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '60px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>💨</div>
                    <div>Humidity</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.2' }}>
                    {fieldData.humidityPct.toFixed(2)}%
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '60px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>🌱</div>
                    <div>Moisture</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', lineHeight: '1.2' }}>
                    {fieldData.moisturePct.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Smart Recommendation */}
              <div style={{
                marginTop: 'auto',
                padding: '12px',
                background: getPriorityColor(topRecommendation.priority) === '#059669' 
                  ? 'rgba(5, 150, 105, 0.1)' 
                  : getPriorityColor(topRecommendation.priority) === '#d97706'
                  ? 'rgba(217, 119, 6, 0.1)'
                  : 'rgba(220, 38, 38, 0.1)',
                border: `1px solid ${getPriorityColor(topRecommendation.priority)}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>{topRecommendation.icon}</span>
                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: getPriorityColor(topRecommendation.priority),
                    marginBottom: '2px'
                  }}>
                    {topRecommendation.message}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    fontWeight: '500'
                  }}>
                    {topRecommendation.priority} priority
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Field Comparison Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h4 style={{
          color: '#1e293b',
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          📊 Field Comparison
        </h4>
        
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                background: 'rgba(148, 163, 184, 0.1)',
                borderBottom: '2px solid rgba(148, 163, 184, 0.2)'
              }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Field</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Temperature</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Humidity</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Moisture</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(fields).map(([fieldKey, fieldData]) => {
                const recommendations = getFieldRecommendations(fieldData);
                const topRecommendation = recommendations[0];
                
                return (
                  <tr key={fieldKey} style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <td style={{ 
                      padding: '12px', 
                      fontWeight: '500', 
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: fieldColors[fieldKey as keyof typeof fieldColors]
                      }}></div>
                      {fieldNames[fieldKey as keyof typeof fieldNames]}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#374151' }}>
                      {fieldData.temperatureC.toFixed(2)}°C
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#374151' }}>
                      {fieldData.humidityPct.toFixed(2)}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#374151' }}>
                      {fieldData.moisturePct.toFixed(2)}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: getPriorityColor(topRecommendation.priority) === '#059669' 
                          ? 'rgba(5, 150, 105, 0.1)' 
                          : getPriorityColor(topRecommendation.priority) === '#d97706'
                          ? 'rgba(217, 119, 6, 0.1)'
                          : 'rgba(220, 38, 38, 0.1)',
                        color: getPriorityColor(topRecommendation.priority),
                        border: `1px solid ${getPriorityColor(topRecommendation.priority)}`
                      }}>
                        {topRecommendation.message}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
