from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import random
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], supports_credentials=True)

# ==================== AI МОДЕЛЬ ДЛЯ ДЕТЕКТИРОВАНИЯ АНОМАЛИЙ ====================
class IndustrialAnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.1, 
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.data_window = []
        self.is_trained = False
        self.window_size = 20
        
    def add_data_point(self, pressure, temperature, vibration):
        """Добавляет новую точку данных для анализа"""
        point = [pressure, temperature, vibration]
        self.data_window.append(point)
        
        # Поддерживаем окно фиксированного размера
        if len(self.data_window) > self.window_size:
            self.data_window = self.data_window[-self.window_size:]
            
        # Обучаем модель при накоплении достаточных данных
        if len(self.data_window) >= 15 and not self.is_trained:
            self._train_model()
            
    def _train_model(self):
        """Обучает модель на нормальных данных"""
        if len(self.data_window) < 10:
            return
            
        X = np.array(self.data_window)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_trained = True
        print("✅ AI Model trained on normal operation data")
        
    def detect_anomaly(self, pressure, temperature, vibration):
        """Детектирует аномалию в текущих показаниях"""
        if not self.is_trained or len(self.data_window) < 10:
            return False, 0.0
            
        # Подготавливаем данные
        current_point = np.array([[pressure, temperature, vibration]])
        window_data = np.array(self.data_window)
        
        # Масштабируем
        try:
            current_scaled = self.scaler.transform(current_point)
            window_scaled = self.scaler.transform(window_data)
        except:
            return False, 0.0
            
        # Детектируем аномалии в текущей точке и в окне
        current_anomaly = self.model.predict(current_scaled)[0] == -1
        
        # Вычисляем степень аномальности (anomaly score)
        anomaly_scores = self.model.decision_function(window_scaled)
        avg_anomaly_score = np.mean(anomaly_scores)
        
        # Преобразуем в процент уверенности (0-100%)
        confidence = max(0, min(100, (abs(avg_anomaly_score) * 100)))
        
        return current_anomaly, confidence

# Инициализация детектора
anomaly_detector = IndustrialAnomalyDetector()

# ==================== СИМУЛЯЦИЯ ТЕХНОЛОГИЧЕСКОГО ПРОЦЕССА ====================
class PumpSimulator:
    def __init__(self):
        self.pressure = 0.0
        self.temperature = 25.0
        self.vibration = 0.1
        self.attack_progress = 0.0
        
    def simulate_normal_operation(self):
        """Симуляция нормальной работы насоса"""
        time_factor = datetime.now().timestamp() * 0.1
        
        self.pressure = 75.0 + 5.0 * np.sin(time_factor) + random.uniform(-1, 1)
        self.temperature = 45.0 + 3.0 * np.sin(time_factor * 0.5) + random.uniform(-0.5, 0.5)
        self.vibration = 1.5 + 0.5 * np.sin(time_factor * 2) + random.uniform(-0.1, 0.1)
        
        # Ограничения по безопасности
        self.pressure = max(0, min(100, self.pressure))
        self.temperature = max(20, min(80, self.temperature))
        self.vibration = max(0.1, min(5.0, self.vibration))
        
    def simulate_cyber_attack(self):
        """Симуляция кибератаки"""
        # Фаза 1: Медленное увеличение давления
        if self.attack_progress < 40:
            target_pressure = 90.0
            current_target = 75.0 + (target_pressure - 75.0) * (self.attack_progress / 40)
            self.pressure += (current_target - self.pressure) * 0.1
            
        # Фаза 2: Резкий скачок
        elif self.attack_progress < 70:
            self.pressure += 1.0 + random.uniform(0, 0.5)
            
        # Фаза 3: Критический режим
        else:
            self.pressure += random.uniform(0.5, 2.0)
            
        # Сопутствующие эффекты атаки
        self.temperature = 45.0 + (self.pressure - 75.0) * 0.5 + random.uniform(-1, 3)
        self.vibration = 1.5 + (self.pressure - 75.0) * 0.1 + random.uniform(-0.2, 0.5)
        
        self.attack_progress = min(100, self.attack_progress + 0.8)
        
        # Ограничения
        self.pressure = max(0, min(120, self.pressure))
        self.temperature = max(20, min(100, self.temperature))
        
    def reset(self):
        self.attack_progress = 0.0
        self.pressure = 0.0
        self.temperature = 25.0
        self.vibration = 0.1

# Инициализация симулятора
pump_simulator = PumpSimulator()

# ==================== API И СИСТЕМНОЕ СОСТОЯНИЕ ====================
system_state = {
    'pump_running': False,
    'under_attack': False,
    'pressure': 0.0,
    'temperature': 25.0,
    'vibration': 0.1,
    'anomaly_detected': False,
    'anomaly_confidence': 0.0,
    'security_level': 'NORMAL',
    'attack_progress': 0,
    'ai_model_trained': False,
    'timestamp': datetime.now().isoformat()
}

@app.route('/api/status', methods=['GET', 'OPTIONS'])
def get_status():
    """Возвращает текущий статус системы с AI-аналитикой"""
    if request.method == 'OPTIONS':
        return '', 200
        
    update_system_state()
    system_state['timestamp'] = datetime.now().isoformat()
    system_state['ai_model_trained'] = anomaly_detector.is_trained
    
    print(f"📊 Sending status: Pressure={system_state['pressure']}, Attack={system_state['under_attack']}")
    
    return jsonify(system_state)

@app.route('/api/pump/<status>', methods=['POST', 'OPTIONS'])
def control_pump(status):
    """Управление насосом"""
    if request.method == 'OPTIONS':
        return '', 200
        
    system_state['pump_running'] = (status == 'start')
    
    if status == 'start':
        pump_simulator.reset()
        system_state['under_attack'] = False
        system_state['anomaly_detected'] = False
        system_state['security_level'] = 'NORMAL'
        system_state['attack_progress'] = 0
        print("🔧 Pump started")
    else:
        print("🔧 Pump stopped")
        
    return jsonify({'message': f'Pump {status}ed', 'status': system_state})

@app.route('/api/attack/<status>', methods=['POST', 'OPTIONS'])
def simulate_attack(status):
    """Симуляция кибератаки"""
    if request.method == 'OPTIONS':
        return '', 200
        
    system_state['under_attack'] = (status == 'start')
    if status == 'start':
        system_state['attack_progress'] = 0
        pump_simulator.attack_progress = 0
        print("🚨 Cyber attack simulation started")
    else:
        print("✅ Cyber attack simulation stopped")
        
    return jsonify({'message': f'Attack {status}ed', 'status': system_state})

@app.route('/api/emergency/stop', methods=['POST', 'OPTIONS'])
def emergency_stop():
    """Аварийная остановка"""
    if request.method == 'OPTIONS':
        return '', 200
        
    system_state['pump_running'] = False
    system_state['under_attack'] = False
    system_state['anomaly_detected'] = False
    system_state['security_level'] = 'NORMAL'
    system_state['attack_progress'] = 0
    pump_simulator.reset()
    
    print("🛑 EMERGENCY STOP: System secured")
    
    return jsonify({'message': 'EMERGENCY STOP: System secured', 'status': system_state})

@app.route('/api/ai/status', methods=['GET', 'OPTIONS'])
def get_ai_status():
    """Статус AI модели"""
    if request.method == 'OPTIONS':
        return '', 200
        
    return jsonify({
        'trained': anomaly_detector.is_trained,
        'data_points': len(anomaly_detector.data_window),
        'window_size': anomaly_detector.window_size
    })

@app.route('/api/debug', methods=['GET'])
def debug_info():
    """Отладочная информация"""
    return jsonify({
        'system_state': system_state,
        'pump_simulator': {
            'pressure': pump_simulator.pressure,
            'temperature': pump_simulator.temperature,
            'vibration': pump_simulator.vibration,
            'attack_progress': pump_simulator.attack_progress
        },
        'ai_detector': {
            'trained': anomaly_detector.is_trained,
            'data_points': len(anomaly_detector.data_window),
            'window_size': anomaly_detector.window_size
        }
    })

def update_system_state():
    """Обновление состояния системы с AI-анализом"""
    if system_state['pump_running']:
        if system_state['under_attack']:
            pump_simulator.simulate_cyber_attack()
        else:
            pump_simulator.simulate_normal_operation()
            
        system_state['pressure'] = round(pump_simulator.pressure, 2)
        system_state['temperature'] = round(pump_simulator.temperature, 1)
        system_state['vibration'] = round(pump_simulator.vibration, 3)
        system_state['attack_progress'] = round(pump_simulator.attack_progress)
        
        # AI анализ
        anomaly_detector.add_data_point(
            system_state['pressure'],
            system_state['temperature'], 
            system_state['vibration']
        )
        
        is_anomaly, confidence = anomaly_detector.detect_anomaly(
            system_state['pressure'],
            system_state['temperature'],
            system_state['vibration']
        )
        
        system_state['anomaly_detected'] = is_anomaly
        system_state['anomaly_confidence'] = round(float(confidence), 1)
        
        # Определение уровня угрозы
        if system_state['under_attack']:
            if system_state['attack_progress'] > 70:
                system_state['security_level'] = 'CRITICAL'
            elif system_state['attack_progress'] > 30:
                system_state['security_level'] = 'WARNING'
            else:
                system_state['security_level'] = 'NORMAL'
        elif is_anomaly:
            if confidence > 50:
                system_state['security_level'] = 'CRITICAL'
            elif confidence > 20:
                system_state['security_level'] = 'WARNING'
            else:
                system_state['security_level'] = 'NORMAL'
        else:
            system_state['security_level'] = 'NORMAL'
            
    else:
        pump_simulator.reset()
        system_state.update({
            'pressure': 0.0,
            'temperature': 25.0,
            'vibration': 0.1,
            'anomaly_detected': False,
            'anomaly_confidence': 0.0,
            'security_level': 'NORMAL',
            'attack_progress': 0
        })

if __name__ == '__main__':
    print("🚀 ICS/OT Shield AI Backend Started")
    print("🤖 AI Features: Real-time anomaly detection with Isolation Forest")
    print("🌐 API endpoints:")
    print("  GET  /api/status - System status with AI analytics")
    print("  POST /api/pump/<start|stop> - Control pump")
    print("  POST /api/attack/<start|stop> - Simulate cyber attack")
    print("  POST /api/emergency/stop - Emergency shutdown")
    print("  GET  /api/ai/status - AI model status")
    print("  GET  /api/debug - Debug information")
    print("🔧 Starting server on http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')