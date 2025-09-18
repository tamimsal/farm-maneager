import React from 'react';

type RecommendationsProps = {
  temperatureC?: number;
  humidityPct?: number;
  moisturePct?: number;
  tankLevelPct?: number;
  timeOfDay?: number; // 0-23 hour
};

type Recommendation = {
  type: 'watering' | 'temperature' | 'humidity' | 'tank' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: string;
  action?: string;
};

export const Recommendations: React.FC<RecommendationsProps> = ({
  temperatureC,
  humidityPct,
  moisturePct,
  tankLevelPct,
  timeOfDay = new Date().getHours()
}) => {
  const getRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Watering recommendations based on soil moisture and time
    if (moisturePct !== undefined) {
      if (moisturePct < 30) {
        recommendations.push({
          type: 'watering',
          priority: 'high',
          title: 'Watering Recommended',
          description: 'Soil moisture is very low. Plants need immediate watering.',
          icon: '💧',
          action: 'Start watering system'
        });
      } else if (moisturePct < 50) {
        recommendations.push({
          type: 'watering',
          priority: 'medium',
          title: 'Consider Watering',
          description: 'Soil moisture is below optimal levels. Monitor closely.',
          icon: '🌱',
          action: 'Check soil conditions'
        });
      } else if (moisturePct > 80) {
        recommendations.push({
          type: 'watering',
          priority: 'low',
          title: 'Reduce Watering',
          description: 'Soil is very moist. Consider reducing irrigation.',
          icon: '🌧️',
          action: 'Pause watering system'
        });
      }
    }

    // Temperature recommendations
    if (temperatureC !== undefined) {
      if (temperatureC > 35) {
        recommendations.push({
          type: 'temperature',
          priority: 'high',
          title: 'High Temperature Alert',
          description: 'Temperature is very high. Plants may be stressed.',
          icon: '🌡️',
          action: 'Increase shade or ventilation'
        });
      } else if (temperatureC > 30) {
        recommendations.push({
          type: 'temperature',
          priority: 'medium',
          title: 'Warm Conditions',
          description: 'Temperature is elevated. Monitor plant health.',
          icon: '☀️',
          action: 'Check ventilation'
        });
      } else if (temperatureC < 10) {
        recommendations.push({
          type: 'temperature',
          priority: 'high',
          title: 'Low Temperature Alert',
          description: 'Temperature is very low. Protect sensitive plants.',
          icon: '❄️',
          action: 'Add heating or cover plants'
        });
      }
    }

    // Humidity recommendations
    if (humidityPct !== undefined) {
      if (humidityPct > 85) {
        recommendations.push({
          type: 'humidity',
          priority: 'medium',
          title: 'High Humidity',
          description: 'Humidity is very high. Risk of fungal diseases.',
          icon: '💨',
          action: 'Improve air circulation'
        });
      } else if (humidityPct < 40) {
        recommendations.push({
          type: 'humidity',
          priority: 'medium',
          title: 'Low Humidity',
          description: 'Humidity is low. Plants may need more frequent watering.',
          icon: '🌵',
          action: 'Increase humidity or watering'
        });
      }
    }

    // Tank level recommendations
    if (tankLevelPct !== undefined) {
      if (tankLevelPct < 20) {
        recommendations.push({
          type: 'tank',
          priority: 'high',
          title: 'Low Water Supply',
          description: 'Water tank is critically low. Refill soon.',
          icon: '⚠️',
          action: 'Refill water tank'
        });
      } else if (tankLevelPct < 40) {
        recommendations.push({
          type: 'tank',
          priority: 'medium',
          title: 'Water Level Low',
          description: 'Water tank level is getting low. Plan for refill.',
          icon: '📉',
          action: 'Monitor tank level'
        });
      }
    }

    // Time-based recommendations
    if (timeOfDay >= 6 && timeOfDay <= 10) {
      recommendations.push({
        type: 'general',
        priority: 'low',
        title: 'Morning Check',
        description: 'Good time to check plant health and soil conditions.',
        icon: '🌅',
        action: 'Inspect plants'
      });
    } else if (timeOfDay >= 18 && timeOfDay <= 22) {
      recommendations.push({
        type: 'general',
        priority: 'low',
        title: 'Evening Maintenance',
        description: 'Good time for maintenance tasks and system checks.',
        icon: '🌆',
        action: 'System maintenance'
      });
    }

    // Optimal conditions message
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'general',
        priority: 'low',
        title: 'Optimal Conditions',
        description: 'All systems are running well. Continue monitoring.',
        icon: '✅',
        action: 'Continue monitoring'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const recommendations = getRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'rgba(220, 38, 38, 0.1)';
      case 'medium': return 'rgba(217, 119, 6, 0.1)';
      case 'low': return 'rgba(5, 150, 105, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        color: '#1e293b',
        margin: '0 0 16px 0',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        💡 Smart Recommendations
      </h3>

      <div style={{
        display: 'grid',
        gap: '12px'
      }}>
        {recommendations.map((rec, index) => (
          <div key={index} style={{
            background: getPriorityBg(rec.priority),
            border: `1px solid ${getPriorityColor(rec.priority)}`,
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '20px',
              marginTop: '2px'
            }}>
              {rec.icon}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{
                  color: getPriorityColor(rec.priority),
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {rec.title}
                </span>
                <span style={{
                  background: getPriorityColor(rec.priority),
                  color: '#ffffff',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  textTransform: 'uppercase'
                }}>
                  {rec.priority}
                </span>
              </div>
              
              <p style={{
                color: '#475569',
                fontSize: '13px',
                margin: '0 0 8px 0',
                lineHeight: '1.4'
              }}>
                {rec.description}
              </p>
              
              {rec.action && (
                <div style={{
                  fontSize: '12px',
                  color: getPriorityColor(rec.priority),
                  fontWeight: '500'
                }}>
                  💡 {rec.action}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Current Conditions Summary */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Current Conditions:
        </div>
        <div style={{
          fontSize: '11px',
          color: '#475569',
          lineHeight: '1.4'
        }}>
          {temperatureC !== undefined && `🌡️ ${temperatureC.toFixed(2)}°C `}
          {humidityPct !== undefined && `💨 ${humidityPct.toFixed(2)}% humidity `}
          {moisturePct !== undefined && `🌱 ${moisturePct.toFixed(2)}% soil moisture `}
          {tankLevelPct !== undefined && `💧 ${tankLevelPct.toFixed(2)}% tank level`}
        </div>
      </div>
    </div>
  );
};
