'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Динамически импортируем компоненты с правильными путями
const PumpVisualization = dynamic(() => import('../../components/PumpVisualization'), { 
  ssr: false,
  loading: () => <div className="bg-slate-800/50 rounded-xl p-6 h-64 animate-pulse">Loading visualization...</div>
});

const ControlPanel = dynamic(() => import('../../components/ControlPanel'), { 
  ssr: false,
  loading: () => <div className="bg-slate-800/50 rounded-xl p-6 h-48 animate-pulse">Loading controls...</div>
});

const MetricsDashboard = dynamic(() => import('../../components/MetricsDashboard'), { 
  ssr: false,
  loading: () => <div className="bg-slate-800/50 rounded-xl p-6 h-96 animate-pulse">Loading metrics...</div>
});

const AlertSystem = dynamic(() => import('../../components/AlertSystem'), { 
  ssr: false,
  loading: () => <div className="bg-slate-800/50 rounded-xl p-6 h-96 animate-pulse">Loading alerts...</div>
});

const SystemStatusPanel = dynamic(() => import('../../components/SystemStatusPanel'), { 
  ssr: false,
  loading: () => <div className="bg-slate-800/50 rounded-xl p-6 h-48 animate-pulse">Loading status...</div>
});

export interface SystemStatus {
  pump_running: boolean;
  under_attack: boolean;
  pressure: number;
  temperature: number;
  vibration: number;
  anomaly_detected: boolean;
  anomaly_confidence: number;
  security_level: 'NORMAL' | 'WARNING' | 'CRITICAL';
  attack_progress: number;
  ai_model_trained: boolean;
  timestamp: string;
}

export default function HomePage() {
  const [status, setStatus] = useState<SystemStatus>({
    pump_running: false,
    under_attack: false,
    pressure: 0.0,
    temperature: 25.0,
    vibration: 0.1,
    anomaly_detected: false,
    anomaly_confidence: 0.0,
    security_level: 'NORMAL',
    attack_progress: 0,
    ai_model_trained: false,
    timestamp: new Date().toISOString()
  });

  const [isClient, setIsClient] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const [metricsHistory, setMetricsHistory] = useState<{
    pressure: number[];
    temperature: number[];
    vibration: number[];
    timestamps: string[];
  }>({
    pressure: [],
    temperature: [],
    vibration: [],
    timestamps: []
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Запрос данных к бэкенду
  useEffect(() => {
    if (!isClient) return;

    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        console.log('🔌 Connecting to backend:', `${API_URL}/api/status`);
        
        const response = await fetch(`${API_URL}/api/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors', // Явно указываем CORS режим
          credentials: 'include' // Включаем credentials для CORS
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received from backend:', data);
        
        setStatus(data);
        setIsConnected(true);
        setConnectionError('');
        
        // Обновляем историю метрик
        setMetricsHistory(prev => ({
          pressure: [...prev.pressure.slice(-49), data.pressure],
          temperature: [...prev.temperature.slice(-49), data.temperature],
          vibration: [...prev.vibration.slice(-49), data.vibration],
          timestamps: [...prev.timestamps.slice(-49), new Date().toLocaleTimeString()]
        }));
        
      } catch (error: any) {
        console.error('❌ Backend connection error:', error);
        setIsConnected(false);
        setConnectionError(error.message);
        
        // Fallback: используем тестовые данные
        const testData: SystemStatus = {
          pump_running: false,
          under_attack: false,
          pressure: 0.0,
          temperature: 25.0,
          vibration: 0.1,
          anomaly_detected: false,
          anomaly_confidence: 0.0,
          security_level: 'NORMAL',
          attack_progress: 0,
          ai_model_trained: false,
          timestamp: new Date().toISOString()
        };
        
        setStatus(testData);
      }
    };

    const interval = setInterval(fetchData, 2000);
    fetchData();

    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading ICS/OT Shield AI...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-lg border-b border-blue-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                ICS/OT Shield AI
              </h1>
              <p className="text-blue-300/80 text-sm">Protecting Industrial Infrastructure</p>
              <div className={`text-xs mt-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? '✅ Connected to backend' : '❌ Disconnected from backend'}
                {connectionError && ` - ${connectionError}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Last update</div>
              <div className="text-green-400 font-mono text-sm">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-1 space-y-6">
            <SystemStatusPanel status={status} />
            <ControlPanel status={status} />
          </div>

          {/* Center Column */}
          <div className="xl:col-span-2 space-y-6">
            <PumpVisualization status={status} />
            <MetricsDashboard status={status} metricsHistory={metricsHistory} />
          </div>

          {/* Right Column */}
          <div className="xl:col-span-1">
            <AlertSystem status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}