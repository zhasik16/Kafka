'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Динамически импортируем компоненты с отключением SSR
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
  security_level: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export default function Home() {
  const [status, setStatus] = useState<SystemStatus>({
    pump_running: false,
    under_attack: false,
    pressure: 0.0,
    temperature: 25.0,
    vibration: 0.1,
    anomaly_detected: false,
    security_level: 'NORMAL',
    timestamp: new Date().toISOString()
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Запрос данных к бэкенду
  useEffect(() => {
    if (!isClient) return;

    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/status`);
        const data = await response.json();
        
        setStatus(data);
        
        // Обновляем историю метрик
        setMetricsHistory(prev => ({
          pressure: [...prev.pressure.slice(-49), data.pressure],
          temperature: [...prev.temperature.slice(-49), data.temperature],
          vibration: [...prev.vibration.slice(-49), data.vibration],
          timestamps: [...prev.timestamps.slice(-49), new Date().toLocaleTimeString()]
        }));
      } catch (error) {
        console.error('Ошибка подключения к бэкенду:', error);
      }
    };

    const interval = setInterval(fetchData, 1000);
    fetchData(); // Первый запрос

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
      {/* Хедер */}
      <header className="bg-black/40 backdrop-blur-lg border-b border-blue-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                ICS/OT Shield AI
              </h1>
              <p className="text-blue-300/80 text-sm">Protecting Industrial Infrastructure</p>
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

      {/* Основной контент */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Левая колонка - статус и управление */}
          <div className="xl:col-span-1 space-y-6">
            <SystemStatusPanel status={status} />
            <ControlPanel status={status} />
          </div>

          {/* Центральная колонка - визуализация и метрики */}
          <div className="xl:col-span-2 space-y-6">
            <PumpVisualization status={status} />
            <MetricsDashboard status={status} metricsHistory={metricsHistory} />
          </div>

          {/* Правая колонка - алерты */}
          <div className="xl:col-span-1">
            <AlertSystem status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}