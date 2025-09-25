'use client';

import { SystemStatus } from '@/app/page';
import { useState, useEffect } from 'react';

interface Alert {
  id: number;
  type: 'SECURITY' | 'OPERATIONAL' | 'SYSTEM';
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export default function AlertSystem({ status }: { status: SystemStatus }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Генерация тестовых алертов на основе статуса
  useEffect(() => {
    const newAlerts: Alert[] = [];

    if (status.anomaly_detected) {
      newAlerts.push({
        id: Date.now(),
        type: 'SECURITY',
        level: 'CRITICAL',
        message: 'AI detected abnormal pressure pattern consistent with cyber attack',
        timestamp: new Date().toLocaleTimeString(),
        acknowledged: false
      });
    }

    if (status.pressure > 18) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'OPERATIONAL',
        level: 'HIGH',
        message: `High pressure detected: ${status.pressure.toFixed(1)} bar`,
        timestamp: new Date().toLocaleTimeString(),
        acknowledged: false
      });
    }

    if (status.temperature > 85) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'OPERATIONAL',
        level: 'MEDIUM',
        message: `Elevated temperature: ${status.temperature.toFixed(1)}°C`,
        timestamp: new Date().toLocaleTimeString(),
        acknowledged: false
      });
    }

    if (status.under_attack && !status.anomaly_detected) {
      newAlerts.push({
        id: Date.now() + 3,
        type: 'SECURITY',
        level: 'HIGH',
        message: 'Attack simulation active - monitoring system response',
        timestamp: new Date().toLocaleTimeString(),
        acknowledged: false
      });
    }

    // Добавляем только новые алерты
    setAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.message));
      const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.has(alert.message));
      return [...uniqueNewAlerts, ...prev].slice(0, 10); // Ограничиваем 10 алертами
    });

  }, [status]);

  const acknowledgeAlert = (id: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'HIGH': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'MEDIUM': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'LOW': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'SECURITY': return '🛡️';
      case 'OPERATIONAL': return '⚙️';
      case 'SYSTEM': return '🖥️';
      default: return 'ℹ️';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  const displayedAlerts = showAcknowledged ? alerts : activeAlerts;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm h-full">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Alert System</h2>
          <div className="flex items-center space-x-2">
            {activeAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {activeAlerts.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setShowAcknowledged(false)}
            className={`px-3 py-1 rounded text-sm ${
              !showAcknowledged 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            Active ({activeAlerts.length})
          </button>
          <button
            onClick={() => setShowAcknowledged(true)}
            className={`px-3 py-1 rounded text-sm ${
              showAcknowledged 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            All ({alerts.length})
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayedAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">🎯</div>
              <div>No alerts</div>
              <div className="text-sm">System operating normally</div>
            </div>
          ) : (
            displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertColor(alert.level)} ${
                  alert.acknowledged ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span>{getAlertIcon(alert.type)}</span>
                    <span className="font-medium text-xs uppercase tracking-wide">
                      {alert.level}
                    </span>
                  </div>
                  <span className="text-xs opacity-75">{alert.timestamp}</span>
                </div>
                <div className="text-sm mb-2">{alert.message}</div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Статус AI системы */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">AI Monitoring</span>
          <span className={`flex items-center space-x-1 ${
            status.anomaly_detected ? 'text-red-400' : 'text-green-400'
          }`}>
            <span>{status.anomaly_detected ? '🔴' : '🟢'}</span>
            <span>{status.anomaly_detected ? 'Alert' : 'Active'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}