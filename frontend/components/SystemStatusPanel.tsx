'use client';

import { useState, useEffect } from 'react';

import { SystemStatus } from '@/app/page';

interface SystemStatusPanelProps {
  status: SystemStatus;
}

export default function SystemStatusPanel({ status }: SystemStatusPanelProps) {
  const getStatusColor = (level: string) => {
    switch (level) {
      case 'NORMAL': return 'text-green-400 bg-green-400/10';
      case 'WARNING': return 'text-yellow-400 bg-yellow-400/10';
      case 'CRITICAL': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'NORMAL': return '🟢';
      case 'WARNING': return '🟡';
      case 'CRITICAL': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold mb-4 text-white">System Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Security Level</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.security_level)}`}>
            {getStatusIcon(status.security_level)} {status.security_level}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-300">Pump Status</span>
          <span className={status.pump_running ? "text-green-400" : "text-red-400"}>
            {status.pump_running ? "🟢 RUNNING" : "🔴 STOPPED"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-300">Attack Simulation</span>
          <span className={status.under_attack ? "text-red-400" : "text-green-400"}>
            {status.under_attack ? "🔴 ACTIVE" : "🟢 INACTIVE"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-300">Anomaly Detection</span>
          <span className={status.anomaly_detected ? "text-red-400" : "text-green-400"}>
            {status.anomaly_detected ? "🔴 ALERT" : "🟢 NORMAL"}
          </span>
        </div>
      </div>

      {/* Индикаторы */}
      <div className="mt-6 space-y-3">
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Pressure</span>
            <span>{status.pressure.toFixed(1)} bar</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(status.pressure / 20 * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Temperature</span>
            <span>{status.temperature.toFixed(1)}°C</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(status.temperature / 100 * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}