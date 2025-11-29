"""
MCP (Model Context Protocol) Server
Acts as intermediary between log collection and AI model
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import uvicorn
from datetime import datetime
import asyncio

# Import AI detector
from ai_detector import detector

app = FastAPI(title="MCP Anomaly Detection Server")

class LogEntry(BaseModel):
    """Log entry model"""
    timestamp: float
    user_id: str
    session_id: str
    ip: str
    event_type: str
    cursor_speed: Optional[float] = 0
    keystroke_speed: Optional[int] = 300
    session_duration: Optional[int] = 0
    api_calls_count: Optional[int] = 0
    failed_logins: Optional[int] = 0
    user_agent: Optional[str] = ""
    raw_log: Optional[str] = ""

class AnomalyPrediction(BaseModel):
    """AI model prediction result"""
    is_anomaly: bool
    confidence: float
    reason: str
    severity: str
    recommended_action: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_trained": detector.is_trained,
        "server": "MCP Anomaly Detection",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/mcp/infer", response_model=AnomalyPrediction)
async def infer_anomaly(log: LogEntry):
    """
    Main MCP endpoint: Receive log, analyze with AI, return prediction
    
    This is the core MCP function that:
    1. Receives log data from the main server
    2. Forwards to AI model for analysis
    3. Returns prediction with recommended action
    """
    try:
        # Convert log to dict for AI model
        log_data = {
            'timestamp': log.timestamp,
            'user_id': log.user_id,
            'session_id': log.session_id,
            'ip': log.ip,
            'cursor_speed': log.cursor_speed or 0,
            'keystroke_speed': log.keystroke_speed or 300,
            'session_duration': log.session_duration or 0,
            'api_calls_count': log.api_calls_count or 0,
            'failed_logins': log.failed_logins or 0
        }
        
        # Get AI prediction
        is_anomaly, confidence, reason = detector.predict(log_data)
        
        # Determine severity based on confidence
        if confidence > 0.8:
            severity = "high"
        elif confidence > 0.5:
            severity = "medium"
        else:
            severity = "low"
        
        # Determine recommended action
        if severity == "high":
            action = "block_ip"
        elif severity == "medium":
            action = "alert"
        else:
            action = "monitor"
        
        return AnomalyPrediction(
            is_anomaly=is_anomaly,
            confidence=round(confidence, 3),
            reason=reason,
            severity=severity,
            recommended_action=action
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI inference failed: {str(e)}")

@app.post("/mcp/train")
async def train_model(logs: List[LogEntry]):
    """
    Train the AI model with new normal behavior data
    This allows the model to adapt to organization-specific patterns
    """
    try:
        training_data = [
            {
                'timestamp': log.timestamp,
                'cursor_speed': log.cursor_speed or 0,
                'keystroke_speed': log.keystroke_speed or 300,
                'session_duration': log.session_duration or 0,
                'api_calls_count': log.api_calls_count or 0,
                'ip': log.ip
            }
            for log in logs
        ]
        
        success = detector.train(training_data)
        
        return {
            "success": success,
            "samples_trained": len(logs),
            "message": "Model training completed" if success else "Training failed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.get("/mcp/stats")
async def get_stats():
    """Get MCP server and model statistics"""
    return {
        "model_trained": detector.is_trained,
        "model_type": "Isolation Forest",
        "features_used": [
            "login_hour",
            "day_of_week", 
            "cursor_speed",
            "keystroke_speed",
            "session_duration",
            "api_calls",
            "ip_score"
        ],
        "detection_capabilities": [
            "Unusual login times",
            "Abnormal typing patterns",
            "Suspicious cursor movements",
            "Geographic anomalies",
            "Behavioral deviations"
        ]
    }

if __name__ == "__main__":
    print("🚀 Starting MCP Anomaly Detection Server on port 8001...")
    print("📊 AI Model Status:", "Trained" if detector.is_trained else "Not Trained")
    uvicorn.run(app, host="0.0.0.0", port=8001)
