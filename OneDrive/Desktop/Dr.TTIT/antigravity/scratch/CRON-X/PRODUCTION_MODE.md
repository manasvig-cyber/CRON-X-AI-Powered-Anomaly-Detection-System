# CRON-X - Production Real-Time Monitoring

## Alert Generation Status

**DUMMY ALERTS: DISABLED** ✅

The system is now configured for **real-time monitoring only**. Alerts will only appear when:
- Real anomalies are detected by your monitoring systems
- Manual alerts are triggered via API for testing

## Testing the System

### Manual Alert Testing

To test the alert system, trigger a manual alert:

**Via curl:**
```bash
curl -X POST http://localhost:8000/api/trigger-alert
```

**Via browser:**
Open: `http://localhost:8000/docs` and use the Swagger UI to call `/api/trigger-alert`

### Production Integration

To connect real monitoring data:

1. **Replace `generate_alert()` with your data source**
   - Edit `backend/main.py` 
   - Integrate with your actual anomaly detection system
   - Replace the `generate_alert()` call with real event data

2. **API Endpoint for External Systems:**
   ```python
   @app.post("/api/ingest-event")
   async def ingest_event(event_data: dict):
       # Process real event data
       # Analyze for anomalies
       # Create alert if anomaly detected
       # Broadcast via WebSocket
   ```

3. **Connect to MCP/Algorithm Services**
   - Point to your actual `/mcp/infer` endpoint
   - Integrate with Decision Engine
   - Connect to Actioner service

## Current Configuration

- **Auto-generated alerts:** OFF
- **Real-time WebSocket:** ON
- **Email notifications:** ON (for real alerts)
- **Manual trigger:** ON (for testing)

## Demo Mode

To re-enable demo mode with auto-generated alerts, uncomment lines 58-82 in `backend/main.py`
