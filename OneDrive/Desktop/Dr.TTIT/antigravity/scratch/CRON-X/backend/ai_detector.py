"""
AI Anomaly Detection Model
This module implements a machine learning-based anomaly detection system
for identifying suspicious user activities.
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import json
from typing import Dict, List, Tuple

class AnomalyDetector:
    def __init__(self):
        """Initialize the anomaly detection model"""
        # Isolation Forest is excellent for anomaly detection
        self.model = IsolationForest(
            contamination=0.1,  # Expected proportion of anomalies
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def extract_features(self, log_data: Dict) -> np.ndarray:
        """
        Extract features from log data for AI analysis
        
        Features:
        - Login hour (0-23)
        - Day of week (0-6)
        - Cursor movement speed (if available)
        - Keystroke speed (if available)
        - Session duration
        - Number of API calls
        - Geographic anomaly score (IP-based)
        """
        features = []
        
        # Time-based features
        timestamp = log_data.get('timestamp', datetime.now().timestamp())
        dt = datetime.fromtimestamp(timestamp)
        hour = dt.hour
        day_of_week = dt.weekday()
        
        features.append(hour)
        features.append(day_of_week)
        
        # Behavioral features
        cursor_speed = log_data.get('cursor_speed', 0)
        keystroke_speed = log_data.get('keystroke_speed', 300)
        session_duration = log_data.get('session_duration', 0)
        api_calls = log_data.get('api_calls_count', 0)
        
        features.append(cursor_speed)
        features.append(keystroke_speed)
        features.append(session_duration)
        features.append(api_calls)
        
        # Geographic anomaly (simplified - IP range)
        ip = log_data.get('ip', '0.0.0.0')
        ip_parts = ip.split('.')
        ip_score = int(ip_parts[0]) if ip_parts else 0
        features.append(ip_score)
        
        return np.array(features).reshape(1, -1)
    
    def train(self, training_logs: List[Dict]):
        """Train the model on normal user behavior"""
        if len(training_logs) < 10:
            print("Warning: Not enough training data")
            return False
            
        # Extract features from all training logs
        feature_matrix = np.vstack([
            self.extract_features(log).flatten() 
            for log in training_logs
        ])
        
        # Normalize features
        self.scaler.fit(feature_matrix)
        normalized_features = self.scaler.transform(feature_matrix)
        
        # Train the model
        self.model.fit(normalized_features)
        self.is_trained = True
        
        print(f"Model trained on {len(training_logs)} samples")
        return True
    
    def predict(self, log_data: Dict) -> Tuple[bool, float, str]:
        """
        Predict if a log entry is anomalous
        
        Returns:
            Tuple of (is_anomaly, confidence_score, reason)
        """
        if not self.is_trained:
            # Use rule-based detection if model not trained
            return self._rule_based_detection(log_data)
        
        # Extract and normalize features
        features = self.extract_features(log_data)
        normalized = self.scaler.transform(features)
        
        # Get prediction (-1 = anomaly, 1 = normal)
        prediction = self.model.predict(normalized)[0]
        
        # Get anomaly score (lower = more anomalous)
        score = self.model.score_samples(normalized)[0]
        
        # Convert to probability (0-1, higher = more anomalous)
        # Isolation Forest scores are negative, so we transform them
        anomaly_probability = 1 / (1 + np.exp(score * 2))
        
        is_anomaly = prediction == -1
        
        # Determine reason
        reason = self._get_anomaly_reason(log_data, features)
        
        return is_anomaly, anomaly_probability, reason
    
    def _rule_based_detection(self, log_data: Dict) -> Tuple[bool, float, str]:
        """Fallback rule-based detection when ML model not trained"""
        anomalies = []
        score = 0.0
        
        # Check for unusual login time (2 AM - 5 AM)
        timestamp = log_data.get('timestamp', datetime.now().timestamp())
        hour = datetime.fromtimestamp(timestamp).hour
        if 2 <= hour <= 5:
            anomalies.append("Login at unusual hour")
            score += 0.4
        
        # Check for suspicious keystroke speed
        keystroke_speed = log_data.get('keystroke_speed', 300)
        if keystroke_speed < 100 or keystroke_speed > 600:
            anomalies.append("Abnormal typing speed")
            score += 0.3
        
        # Check for suspicious cursor movements
        cursor_speed = log_data.get('cursor_speed', 0)
        if cursor_speed > 1000:
            anomalies.append("Unusual cursor movement pattern")
            score += 0.3
        
        # Check for multiple failed logins
        if log_data.get('failed_logins', 0) > 3:
            anomalies.append("Multiple failed login attempts")
            score += 0.5
        
        is_anomaly = score > 0.5
        reason = "; ".join(anomalies) if anomalies else "Normal behavior"
        
        return is_anomaly, min(score, 1.0), reason
    
    def _get_anomaly_reason(self, log_data: Dict, features: np.ndarray) -> str:
        """Generate human-readable reason for anomaly"""
        reasons = []
        
        hour = int(features[0, 0])
        keystroke_speed = features[0, 3]
        cursor_speed = features[0, 2]
        
        if 2 <= hour <= 5:
            reasons.append(f"Login at {hour}:00 (unusual hour)")
        
        if keystroke_speed < 100:
            reasons.append("Abnormally slow typing")
        elif keystroke_speed > 600:
            reasons.append("Abnormally fast typing (possible bot)")
        
        if cursor_speed > 1000:
            reasons.append("Erratic cursor movements")
        
        if not reasons:
            reasons.append("Statistical anomaly in behavior pattern")
        
        return "; ".join(reasons)

# Global instance
detector = AnomalyDetector()

def initialize_with_sample_data():
    """Initialize the model with sample normal behavior data"""
    # Generate sample normal user behavior for training
    sample_logs = []
    
    for i in range(100):
        # Normal working hours (9 AM - 6 PM)
        hour = np.random.randint(9, 18)
        timestamp = datetime.now().replace(hour=hour).timestamp()
        
        sample_logs.append({
            'timestamp': timestamp,
            'cursor_speed': np.random.randint(50, 200),
            'keystroke_speed': np.random.randint(250, 400),
            'session_duration': np.random.randint(300, 7200),
            'api_calls_count': np.random.randint(10, 100),
            'ip': f"192.168.1.{np.random.randint(1, 255)}",
            'failed_logins': 0
        })
    
    detector.train(sample_logs)

# Initialize on import
initialize_with_sample_data()
