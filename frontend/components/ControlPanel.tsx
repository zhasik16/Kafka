'use client';

import { SystemStatus } from '@/app/page';

interface ControlPanelProps {
  status: SystemStatus;
}

export default function ControlPanel({ status }: ControlPanelProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handlePumpControl = async (action: 'start' | 'stop') => {
    try {
      await fetch(`${API_URL}/api/pump/${action}`, { method: 'POST' });
    } catch (error) {
      console.error('Error controlling pump:', error);
    }
  };

  const handleAttackSimulation = async (action: 'start' | 'stop') => {
    try {
      await fetch(`${API_URL}/api/attack/${action}`, { method: 'POST' });
    } catch (error) {
      console.error('Error controlling attack simulation:', error);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await fetch(`${API_URL}/api/emergency/stop`, { method: 'POST' });
    } catch (error) {
      console.error('Error emergency stop:', error);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold mb-4 text-white">Control Panel</h2>
      
      <div className="space-y-4">
        {/* Управление насосом */}
        <div>
          <h3 className="font-medium mb-3 text-slate-300">Pump Controls</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handlePumpControl('start')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                status.pump_running 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
              disabled={status.pump_running}
            >
              🟢 Start Pump
            </button>
            <button 
              onClick={() => handlePumpControl('stop')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                !status.pump_running 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 active:scale-95'
              }`}
              disabled={!status.pump_running}
            >
              🔴 Stop Pump
            </button>
          </div>
        </div>

        {/* Симуляция атаки */}
        <div>
          <h3 className="font-medium mb-3 text-slate-300">Attack Simulation</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleAttackSimulation('start')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                status.under_attack 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700 active:scale-95 border border-orange-500'
              }`}
              disabled={status.under_attack}
            >
              ⚡ Start Attack
            </button>
            <button 
              onClick={() => handleAttackSimulation('stop')}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                !status.under_attack 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gray-600 hover:bg-gray-700 active:scale-95 border border-gray-500'
              }`}
              disabled={!status.under_attack}
            >
              🛑 Stop Attack
            </button>
          </div>
        </div>

        {/* Аварийная остановка */}
        <div>
          <button 
            onClick={handleEmergencyStop}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium border border-red-500 active:scale-95 transition-all duration-200 animate-pulse-alert"
          >
            🚨 EMERGENCY STOP
          </button>
        </div>

        {/* Статус подключения */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Backend Connection</span>
            <span className="text-green-400">🟢 Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}