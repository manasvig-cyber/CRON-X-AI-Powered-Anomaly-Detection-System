
# 🤖 CRON-X AI-Powered Anomaly Detection System

## Hackathon Solution: AI-Driven SOC Dashboard

This is a complete **AI-powered anomaly detection system** that identifies suspicious user activities and automatically responds to threats.
AI-Based Intrusion & Behaviour Anomaly Detection System

This project implements an AI-driven security system designed to detect behavioural anomalies and potential intrusions in real time.
It collects logs from multiple sources, analyses user behaviour, identifies suspicious patterns, and triggers automated security responses. 
The architecture includes an AI Model, MCP Server, Log Analysis Engine, Automated Response Algorithm, and a monitoring Dashboard. 
Together, they provide a complete end-to-end detection workflow with human oversight. The system improves security visibility, reduces response time, 
and strengthens protection against modern threats through intelligent behavioural analysis and automated mitigation.

Video link : https://drive.google.com/file/d/1TgROU8OJVgGhVIkAMmYVcRW05EU2AJea/view?usp=sharing

---

## 🏗️ System Architecture

```
┌─────────────┐
│  Dashboard  │ ← Real-time alerts, monitoring
└──────┬──────┘
       │ WebSocket
┌──────▼──────────┐
│  Main Server    │ ← Collects logs, coordinates
│  (port 8000)    │
└──────┬──────────┘
       │ HTTP
┌──────▼──────────┐
│  MCP Server     │ ← Routes logs to AI
│  (port 8001)    │
└──────┬──────────┘
       │
┌──────▼──────────┐
│   AI Model      │ ← Detects anomalies
│ (Isolation      │
│   Forest)       │
└──────┬──────────┘
       │
┌──────▼──────────┐
│ Decision Engine │ ← Automates responses
│ - Block IPs     │
│ - Send Alerts   │
└─────────────────┘
```

---

## 🎯 Key Features

### 1. **AI-Powered Detection**
- **Machine Learning Model**: Isolation Forest algorithm
- **Real-time Analysis**: Instant log processing
- **Adaptive Learning**: Can be retrained with new data
- **Multiple Features**:
  - Login time patterns (detects 2 AM logins)
  - Cursor movement analysis
  - Typing speed detection
  - Geographic anomalies (IP-based)
  - Session behavior patterns

### 2. **MCP Integration**
- **Model Context Protocol** server routes logs to AI
- **Decoupled Architecture**: Easy to swap AI models
- **Health Monitoring**: `/health` endpoint
- **Training API**: `/mcp/train` for model updates

### 3. **Automated Response**
- **IP Blocking**: Automatically block suspicious IPs
- **Timed Release**: Auto-unblock after 30 minutes
- **Severity Levels**: High, Medium, Low
- **Actions**:
  - `block_ip` - Block and alert
  - `alert` - Alert only
  - `monitor` - Log for review

### 4. **Dashboard Integration**
- **Real-time Alerts**: WebSocket push notifications
- **Email Notifications**: For high-severity incidents
- **Override Controls**: Manual review and override
- **Audit Trail**: Complete action logging
- **Blocked IPs View**: Monitor active blocks

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

Dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `scikit-learn` - ML library
- `numpy` - Numerical computing
- `httpx` - Async HTTP client

### Step 2: Start MCP Server (AI Model)
```bash
# Terminal 1
cd backend
python mcp_server.py
```

This starts the MCP server on **port 8001** with the AI model.

### Step 3: Start Main Server
```bash
# Terminal 2
cd backend
python -m uvicorn main:app --reload --port 8000
```

This starts the main API on **port 8000**.

### Step 4: Start Frontend
```bash
# Terminal 3
cd frontend
npm install  # if not already done
npm run dev
```

Dashboard runs on **port 3000**.

### Step 5: Open Dashboard
Navigate to: `http://localhost:3000`

---

## 🧪 Testing the AI System

### Test 1: Simulate Suspicious Activity
```bash
curl -X POST http://localhost:8000/api/simulate-suspicious-activity
```

This simulates:
- Login at 2 AM (unusual time)
- Abnormal cursor speed (1500 - very fast)
- Slow typing speed (50 - suspiciously slow)
- Multiple failed logins (5 attempts)

**Expected Result:**
- AI detects anomaly
- IP gets blocked automatically
- Alert appears on dashboard
- Email sent (if configured)

### Test 2: Manual Log Analysis
```bash
curl -X POST http://localhost:8000/api/log-activity \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "ip": "192.168.1.100",
    "timestamp": 1234567890,
    "cursor_speed": 2000,
    "keystroke_speed": 50,
    "failed_logins": 4
  }'
```

### Test 3: Check Blocked IPs
```bash
curl http://localhost:8000/api/blocked-ips
```

### Test 4: Check AI Status
```bash
curl http://localhost:8000/api/ai-status
```

---

## 📊 API Endpoints

### Main Server (port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/log-activity` | POST | Submit log for AI analysis |
| `/api/blocked-ips` | GET | Get currently blocked IPs |
| `/api/unblock-ip/{ip}` | POST | Manually unblock an IP |
| `/api/ai-status` | GET | Get AI system status |
| `/api/simulate-suspicious-activity` | POST | Test the AI system |
| `/api/trigger-alert` | POST | Manual alert creation |

### MCP Server (port 8001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp/infer` | POST | AI inference on log data |
| `/mcp/train` | POST | Train model with new data |
| `/mcp/stats` | GET | Model statistics |
| `/health` | GET | Health check |

---

## 🎓 How It Works

### 1. Log Collection
```python
# Example log entry
log_data = {
    "timestamp": 1701234567,
    "user_id": "user_123",
    "ip": "203.0.113.45",
    "cursor_speed": 1500,
    "keystroke_speed": 50,
    "failed_logins": 5
}
```

### 2. MCP Processing
- Main server sends log to MCP (`/mcp/infer`)
- MCP extracts features (time, behavior, IP)
- AI model analyzes patterns
- Returns prediction + confidence

### 3. Decision Engine
```python
if prediction.is_anomaly and prediction.confidence > 0.8:
    action = "block_ip"  # High confidence = block
elif prediction.is_anomaly:
    action = "alert"  # Medium confidence = alert
else:
    action = "monitor"  # Normal = just log
```

### 4. Automated Response
- **Block IP**: Add to firewall (simulated)
- **Create Alert**: Send to dashboard via WebSocket
- **Send Email**: Notify security team
- **Log Action**: Audit trail

---

## 🔧 Configuration

### Email Alerts
Create `.env` file in `backend/`:
```env
EMAIL_ALERTS_ENABLED=true
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=security@company.com
SENDER_PASSWORD=your_app_password
ALERT_RECIPIENT_EMAIL=soc@company.com
```

### AI Model Tuning
Edit `backend/ai_detector.py`:
```python
self.model = IsolationForest(
    contamination=0.1,  # Expected % of anomalies (10%)
    n_estimators=100,   # Number of trees
    random_state=42
)
```

---

## 📈 Dashboard Features

### Real-time Monitoring
- Live alerts from AI detections
- WebSocket updates (instant)
- Severity-based color coding

### Alert Management
- View alert details
- Override false positives
- Acknowledge incidents
- See model confidence scores

### Blocked IPs
- View currently blocked IPs
- See unblock countdown
- Manual unblock capability

### Settings
- Configure email alerts
- Adjust notification preferences
- View system status

---

## 🎯 Hackathon Demo Flow

1. **Show Dashboard**: Clean state, "Real-Time Monitoring Active"

2. **Simulate Attack**: Click "Trigger Alert" or use API:
   ```bash
   curl -X POST http://localhost:8000/api/simulate-suspicious-activity
   ```

3. **Watch AI Work**:
   - Alert appears on dashboard in real-time
   - Shows AI confidence score
   - Displays blocked IP
   - Email notification sent

4. **Explain System**:
   - "Logs collected from user activity"
   - "MCP routes to AI model for analysis"
   - "AI detects 2 AM login + weird behavior"
   - "System automatically blocks IP"
   - "Alert sent to SOC team via dashboard"

5. **Show Blocked IPs**:
   ```
   GET /api/blocked-ips
   ```

6. **Override Demo**: Click "Override False Positive" to show manual control

---

## 🏆 Why This Wins

1. **Complete Solution**: End-to-end from logs to action
2. **Real AI**: Actual ML model (Isolation Forest)
3. **MCP Integration**: Proper architecture using MCP
4. **Automation**: Truly automated response (IP blocking)
5. **Production-Ready**: Email alerts, audit logs, overrides
6. **Modern UI**: Beautiful dashboard with real-time updates
7. **Scalable**: Can add more AI models via MCP

---

## 🔮 Future Enhancements

- **Database Integration**: PostgreSQL for log storage
- **Advanced Models**: Neural networks, ensemble methods
- **Threat Intelligence**: IP reputation services
- **User Behavior Analytics**: Long-term pattern analysis
- **Firewall Integration**: Real iptables/firewall control
- **SIEM Integration**: Export to Splunk, ELK, etc.

---

## 📝 Credits

Built for Hackathon - AI-Driven Anomaly Detection System
- **Frontend**: React + TypeScript + Tailwind
- **Backend**: FastAPI + Python
- **AI**: scikit-learn (Isolation Forest)
- **Architecture**: MCP for AI integration
- **Real-time**: WebSocket for live alerts

