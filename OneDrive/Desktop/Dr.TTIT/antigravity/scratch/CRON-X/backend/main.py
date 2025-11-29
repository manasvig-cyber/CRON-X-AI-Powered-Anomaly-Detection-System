import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .routes import api
from .mock_data import generate_alert, MOCK_ALERTS
from .email_service import email_service
from .decision_engine import decision_engine
import json
import time
from datetime import datetime

app = FastAPI(title="CRON-X AI-Powered SOC API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api")

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ===== AI-POWERED ANOMALY DETECTION =====

async def send_alert_to_dashboard(alert_data: dict):
    """Callback function to send alerts to dashboard via WebSocket"""
    from .models import Alert, Event, StructuredReason
    
    # Create full alert object
    alert = Alert(
        alert_id=f"AI_{int(time.time())}_{alert_data.get('user_id', 'unknown')}",
        created_ts=int(alert_data.get('timestamp', time.time())),
        status="open",
        severity=alert_data.get('severity', 'medium'),
        anomaly_score=alert_data.get('confidence', 0.8),
        model_scores={
            "ai_model": alert_data.get('confidence', 0.8),
            "mcp": 0.9
        },
        suggested_action=alert_data.get('action_taken', 'alert'),
        ttl_seconds=1800 if alert_data.get('severity') == 'high' else None,
        user_id=alert_data.get('user_id', 'unknown'),
        session_id=f"sess_{int(time.time())}",
        ip=alert_data.get('ip', '0.0.0.0'),
        events=[],  # Would be populated with actual event data
        structured_reasons=[
            StructuredReason(
                tag="ai_detection",
                weight=alert_data.get('confidence', 0.8),
                detail=alert_data.get('reason', 'AI detected anomaly')
            )
        ],
        notes=[],
        audit=[],
        short_text=f"🤖 AI Alert: {alert_data.get('reason', 'Suspicious activity detected')}"
    )
    
    # Add to alerts list
    MOCK_ALERTS.insert(0, alert)
    if len(MOCK_ALERTS) > 100:
        MOCK_ALERTS.pop()
    
    # Send email if high severity
    if alert.severity == "high" and email_service.enabled:
        recipient = os.getenv("ALERT_RECIPIENT_EMAIL", "")
        if recipient:
            email_service.send_alert_email(recipient, alert.dict())
    
    # Broadcast to dashboard
    msg = {
        "type": "alert_new",
        "alert": alert.dict()
    }
    await manager.broadcast(msg)

# Register callback with decision engine
decision_engine.register_alert_callback(send_alert_to_dashboard)

@app.post("/api/log-activity")
async def log_activity(log_data: dict):
    """
    Receive user activity logs and analyze with AI
    This is the main entry point for the AI system
    """
    try:
        # Add timestamp if not present
        if 'timestamp' not in log_data:
            log_data['timestamp'] = time.time()
        
        # Send to MCP for AI analysis
        prediction = await decision_engine.analyze_log(log_data)
        
        # Execute automated action based on AI prediction
        result = await decision_engine.execute_action(prediction, log_data)
        
        return {
            "success": True,
            "analyzed": True,
            "prediction": prediction,
            "action_result": result,
            "mcp_status": "connected"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "mcp_status": "error"
        }

@app.get("/api/blocked-ips")
async def get_blocked_ips():
    """Get list of currently blocked IPs"""
    blocked = await decision_engine.get_blocked_ips()
    return {"blocked_ips": blocked, "count": len(blocked)}

@app.post("/api/unblock-ip/{ip}")
async def unblock_ip(ip: str):
    """Manually unblock an IP address"""
    if ip in decision_engine.blocked_ips:
        decision_engine.blocked_ips.remove(ip)
        if ip in decision_engine.block_duration:
            del decision_engine.block_duration[ip]
        return {"success": True, "message": f"IP {ip} unblocked"}
    return {"success": False, "message": f"IP {ip} was not blocked"}

@app.get("/api/ai-status")
async def ai_status():
    """Get AI system status"""
    return {
        "ai_enabled": True,
        "mcp_server": decision_engine.mcp_url,
        "blocked_ips_count": len(decision_engine.blocked_ips),
        "model_type": "Isolation Forest",
        "detection_active": True
    }

# ===== SIMULATION & TESTING =====

@app.post("/api/trigger-alert")
async def trigger_alert():
    """Manually trigger a test alert"""
    new_alert = generate_alert()
    
    MOCK_ALERTS.insert(0, new_alert)
    if len(MOCK_ALERTS) > 100:
        MOCK_ALERTS.pop()
    
    if new_alert.severity == "high" and email_service.enabled:
        recipient = os.getenv("ALERT_RECIPIENT_EMAIL", "")
        if recipient:
            email_service.send_alert_email(recipient, new_alert.dict())
    
    msg = {
        "type": "alert_new",
        "alert": new_alert.dict()
    }
    await manager.broadcast(msg)
    
    return {"success": True, "alert_id": new_alert.alert_id}

@app.post("/api/simulate-suspicious-activity")
async def simulate_suspicious_activity():
    """
    Simulate suspicious user activity to test AI detection
    This creates a log entry that should trigger the AI
    """
    # Create suspicious log (login at 2 AM with weird behavior)
    suspicious_log = {
        "timestamp": datetime.now().replace(hour=2, minute=30).timestamp(),
        "user_id": f"user_{int(time.time()) % 100}",
        "session_id": f"sess_suspicious_{int(time.time())}",
        "ip": f"203.0.113.{int(time.time()) % 255}",  # Random IP
        "event_type": "login",
        "cursor_speed": 1500,  # Very fast (suspicious)
        "keystroke_speed": 50,  # Very slow (suspicious)
        "session_duration": 100,
        "api_calls_count": 50,
        "failed_logins": 5  # Multiple failures
    }
    
    # Analyze with AI
    result = await log_activity(suspicious_log)
    
    return {
        "success": True,
        "simulation": "Suspicious activity at 2 AM",
        "ai_result": result
    }

@app.on_event("startup")
async def startup_event():
    """Initialize AI system on startup"""
    print("🤖 AI-Powered CRON-X SOC Starting...")
    print(f"📡 MCP Server: {decision_engine.mcp_url}")
    print("✅ Decision Engine: Ready")
    print("🔒 IP Blocking: Enabled")
    print("📧 Email Alerts: " + ("Enabled" if email_service.enabled else "Disabled"))
