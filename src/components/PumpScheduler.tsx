import React, { useState } from 'react';

export type Schedule = {
  id: string;
  name: string;
  enabled: boolean;
  days: number[]; // 0=Sunday, 1=Monday, etc.
  startTime: string; // HH:MM format
  duration: number; // minutes
  field: string; // which field to water
  lastRun?: Date;
  nextRun?: Date;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const PumpScheduler: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Morning Field 1',
      enabled: true,
      days: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '06:00',
      duration: 30,
      field: 'field1',
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
    },
    {
      id: '2',
      name: 'Evening Field 2',
      enabled: true,
      days: [2, 4, 6], // Tuesday, Thursday, Saturday
      startTime: '18:00',
      duration: 45,
      field: 'field2',
      lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Weekly Field 3',
      enabled: false,
      days: [0], // Sunday only
      startTime: '10:00',
      duration: 60,
      field: 'field3',
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Omit<Schedule, 'id' | 'lastRun' | 'nextRun'>>({
    name: '',
    enabled: true,
    days: [],
    startTime: '08:00',
    duration: 30,
    field: 'field1'
  });

  const toggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const addSchedule = () => {
    if (newSchedule.name && newSchedule.days.length > 0) {
      const schedule: Schedule = {
        ...newSchedule,
        id: Date.now().toString(),
        lastRun: undefined,
        nextRun: calculateNextRun(newSchedule)
      };
      setSchedules(prev => [...prev, schedule]);
      setNewSchedule({
        name: '',
        enabled: true,
        days: [],
        startTime: '08:00',
        duration: 30,
        field: 'field1'
      });
      setShowAddForm(false);
    }
  };

  const calculateNextRun = (schedule: Omit<Schedule, 'id' | 'lastRun' | 'nextRun'>): Date => {
    const now = new Date();
    const [hours, minutes] = schedule.startTime.split(':').map(Number);
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);
    
    // Find next occurrence
    let daysAhead = 0;
    while (daysAhead < 7) {
      const checkDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      if (schedule.days.includes(checkDate.getDay())) {
        const nextRun = new Date(checkDate);
        nextRun.setHours(hours, minutes, 0, 0);
        if (nextRun > now) {
          return nextRun;
        }
      }
      daysAhead++;
    }
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatNextRun = (date?: Date) => {
    if (!date) return 'Not scheduled';
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h`;
    return 'Now';
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      borderRadius: '12px', 
      padding: '20px',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ 
          color: '#1e293b', 
          margin: 0,
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🚰 Water Pump Scheduler
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: showAddForm 
              ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
              : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            border: 'none',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Schedule'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Schedule name"
              value={newSchedule.name}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#1e293b',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <select
              value={newSchedule.field}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, field: e.target.value }))}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#1e293b',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
                              <option value="field1">Field 1</option>
                <option value="field2">Field 2</option>
                <option value="field3">Field 3</option>
                <option value="field4">Field 4</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <input
              type="time"
              value={newSchedule.startTime}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#1e293b',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={newSchedule.duration}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#1e293b',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#475569', marginBottom: '12px', fontWeight: '500' }}>Days:</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => {
                    const newDays = newSchedule.days.includes(index)
                      ? newSchedule.days.filter(d => d !== index)
                      : [...newSchedule.days, index];
                    setNewSchedule(prev => ({ ...prev, days: newDays }));
                  }}
                  style={{
                    background: newSchedule.days.includes(index) 
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                      : 'rgba(148, 163, 184, 0.1)',
                    border: `1px solid ${newSchedule.days.includes(index) ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!newSchedule.days.includes(index)) {
                      e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!newSchedule.days.includes(index)) {
                      e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
                    }
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addSchedule}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
            }}
          >
            Add Schedule
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {schedules.map(schedule => (
          <div key={schedule.id} style={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
            padding: '16px', 
            borderRadius: '10px',
            border: schedule.enabled 
              ? '2px solid #10b981' 
              : '2px solid rgba(148, 163, 184, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ 
                color: '#1e293b', 
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {schedule.name}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => toggleSchedule(schedule.id)}
                  style={{
                    background: schedule.enabled 
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                      : 'rgba(148, 163, 184, 0.2)',
                    border: `1px solid ${schedule.enabled ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {schedule.enabled ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => deleteSchedule(schedule.id)}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px', 
              fontSize: '13px', 
              color: '#475569',
              marginBottom: '12px'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Field:</span> 
                <span style={{ color: '#1e293b', fontWeight: '500' }}>
                  {schedule.field === 'field1' ? 'Field 1' : schedule.field}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Time:</span> 
                <span style={{ color: '#1e293b', fontWeight: '500' }}>{schedule.startTime}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Duration:</span> 
                <span style={{ color: '#1e293b', fontWeight: '500' }}>{formatDuration(schedule.duration)}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Days:</span> 
                <span style={{ color: '#1e293b', fontWeight: '500' }}>
                  {schedule.days.map(d => DAYS[d]).join(', ')}
                </span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '12px', 
              color: '#64748b',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '6px'
            }}>
              <span>Last: {schedule.lastRun ? schedule.lastRun.toLocaleDateString() : 'Never'}</span>
              <span>Next: {formatNextRun(schedule.nextRun)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
