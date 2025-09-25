'use client';

import { SystemStatus } from '@/app/page';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MetricsDashboardProps {
  status: SystemStatus;
  metricsHistory: {
    pressure: number[];
    temperature: number[];
    vibration: number[];
    timestamps: string[];
  };
}

export default function MetricsDashboard({ status, metricsHistory }: MetricsDashboardProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(100, 100, 100, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(148, 163, 184)',
        },
      },
    },
  };

  const chartData = {
    labels: metricsHistory.timestamps,
    datasets: [
      {
        label: 'Pressure (bar)',
        data: metricsHistory.pressure,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
        pointRadius: 2,
      },
      {
        label: 'Temperature (°C)',
        data: metricsHistory.temperature,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
        pointRadius: 2,
      },
      {
        label: 'Vibration (mm/s)',
        data: metricsHistory.vibration,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
        pointRadius: 2,
        hidden: true,
      },
    ],
  };

  const metrics = [
    {
      label: 'Pressure',
      value: status.pressure.toFixed(1),
      unit: 'bar',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      icon: '📊',
      normalRange: '5-15 bar',
      currentStatus: status.pressure > 15 ? 'High' : status.pressure < 5 ? 'Low' : 'Normal'
    },
    {
      label: 'Temperature',
      value: status.temperature.toFixed(1),
      unit: '°C',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      icon: '🌡️',
      normalRange: '20-80°C',
      currentStatus: status.temperature > 80 ? 'High' : status.temperature < 20 ? 'Low' : 'Normal'
    },
    {
      label: 'Vibration',
      value: status.vibration.toFixed(3),
      unit: 'mm/s',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      icon: '📳',
      normalRange: '0.1-2.0 mm/s',
      currentStatus: status.vibration > 2.0 ? 'High' : 'Normal'
    },
    {
      label: 'Security',
      value: status.security_level,
      unit: '',
      color: status.security_level === 'CRITICAL' ? 'text-red-400' : 
             status.security_level === 'WARNING' ? 'text-yellow-400' : 'text-green-400',
      bgColor: status.security_level === 'CRITICAL' ? 'bg-red-400/10' : 
               status.security_level === 'WARNING' ? 'bg-yellow-400/10' : 'bg-green-400/10',
      icon: status.security_level === 'CRITICAL' ? '🚨' : 
            status.security_level === 'WARNING' ? '⚠️' : '🛡️',
      normalRange: 'NORMAL',
      currentStatus: status.security_level
    }
  ];

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold mb-4 text-white">Real-time Metrics</h2>
      
      {/* Быстрые метрики */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className={`${metric.bgColor} rounded-lg p-4 border border-slate-600/30`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">{metric.label}</span>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}<span className="text-sm ml-1">{metric.unit}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {metric.normalRange} • {metric.currentStatus}
            </div>
          </div>
        ))}
      </div>

      {/* График */}
      <div className="h-64">
        <Line options={chartOptions} data={chartData} />
      </div>

      {/* Легенда графика */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-blue-400"></div>
          <span>Pressure</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-orange-400"></div>
          <span>Temperature</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-green-400"></div>
          <span>Vibration</span>
        </div>
      </div>
    </div>
  );
}