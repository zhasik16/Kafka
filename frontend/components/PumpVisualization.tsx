import { SystemStatus } from '@/app/page';

interface PumpVisualizationProps {
  status: SystemStatus;
}

export default function PumpVisualization({ status }: PumpVisualizationProps) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold mb-4 text-white">Pump Station Visualization</h2>
      
      <div className="relative h-64 bg-slate-900/50 rounded-lg border border-slate-600/30">
        {/* Визуализация насосной станции */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Основной насос */}
          <div className={`relative w-32 h-32 rounded-full border-4 ${
            status.pump_running 
              ? 'border-green-400 bg-green-400/10 animate-pulse' 
              : 'border-gray-500 bg-gray-400/10'
          }`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-2xl ${status.pump_running ? 'text-green-400' : 'text-gray-400'}`}>
                ⚙️
              </div>
            </div>
          </div>

          {/* Трубы */}
          <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 w-64">
            {/* Входная труба */}
            <div className="absolute -left-32 top-0 w-32 h-4 bg-blue-500/30 rounded-l-full">
              <div 
                className={`h-full rounded-l-full transition-all duration-300 ${
                  status.pump_running ? 'bg-blue-500 animate-pulse' : 'bg-blue-500/30'
                }`}
                style={{ width: status.pump_running ? '100%' : '0%' }}
              ></div>
            </div>

            {/* Выходная труба */}
            <div className="absolute -right-32 top-0 w-32 h-4 bg-green-500/30 rounded-r-full">
              <div 
                className={`h-full rounded-r-full transition-all duration-300 ${
                  status.pump_running ? 'bg-green-500 animate-pulse' : 'bg-green-500/30'
                }`}
                style={{ width: status.pump_running ? '100%' : '0%' }}
              ></div>
            </div>
          </div>

          {/* Индикатор атаки */}
          {status.under_attack && (
            <div className="absolute top-4 right-4">
              <div className="animate-pulse-alert bg-red-500/20 border border-red-500 rounded-lg px-3 py-1">
                <span className="text-red-400 text-sm font-bold">⚡ ATTACK</span>
              </div>
            </div>
          )}

          {/* Индикатор аномалии */}
          {status.anomaly_detected && (
            <div className="absolute bottom-4 left-4">
              <div className="alert-glow bg-red-500/30 border border-red-500 rounded-lg px-3 py-1">
                <span className="text-red-400 text-sm font-bold">🚨 ANOMALY DETECTED</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Легенда */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-slate-300">Normal Flow</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-slate-300">Security Alert</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-slate-300">Input</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span className="text-slate-300">Pressure</span>
        </div>
      </div>
    </div>
  );
}