from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..models import Alert, ChatQuery, ChatResponse, Note, AuditLog
from ..mock_data import MOCK_ALERTS
import time

router = APIRouter()

@router.get("/alerts", response_model=List[Alert])
async def get_alerts(limit: int = 50, severity: Optional[str] = None, status: Optional[str] = None):
    filtered = MOCK_ALERTS
    if severity:
        filtered = [a for a in filtered if a.severity == severity]
    if status:
        filtered = [a for a in filtered if a.status == status]
    return filtered[:limit]

@router.get("/alerts/{alert_id}", response_model=Alert)
async def get_alert_detail(alert_id: str):
    for alert in MOCK_ALERTS:
        if alert.alert_id == alert_id:
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/alerts/{alert_id}/ack", response_model=Alert)
async def ack_alert(alert_id: str, body: dict):
    for alert in MOCK_ALERTS:
        if alert.alert_id == alert_id:
            alert.status = "acknowledged"
            if body.get("note"):
                alert.notes.append(Note(author=body["actor"], ts=int(time.time()), text=body["note"]))
            alert.audit.append(AuditLog(
                type="action",
                actor=body.get("actor", "user"),
                action="acknowledged",
                ts=int(time.time())
            ))
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/alerts/{alert_id}/override")
async def override_alert(alert_id: str, body: dict):
    for alert in MOCK_ALERTS:
        if alert.alert_id == alert_id:
            alert.audit.append(AuditLog(
                type="override",
                actor=body.get("actor", "user"),
                action=body.get("action", "false_positive"),
                ts=int(time.time())
            ))
            alert.status = "resolved"
            alert.notes.append(Note(
                author=body.get("actor", "user"),
                ts=int(time.time()),
                text=f"Override: {body.get('reason', 'False positive')}"
            ))
            return {"success": True, "message": "Alert overridden successfully"}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/chat")
async def chat(query: ChatQuery):
    query_lower = query.query.lower()
    
    # STRICT CONTEXT CHECK
    # Define keywords related to the dashboard domain
    domain_keywords = [
        "alert", "incident", "anomaly", "suspicious", "log", "session", "user", "ip", 
        "block", "status", "system", "dashboard", "severity", "high", "medium", "low",
        "cursor", "typing", "speed", "login", "failed", "mcp", "ai", "model"
    ]
    
    is_relevant = any(keyword in query_lower for keyword in domain_keywords)
    
    if not is_relevant:
        return ChatResponse(
            answer_text="I can only answer questions related to system alerts, security incidents, user sessions, and anomaly detection logs. Please ask about specific alerts, suspicious IPs, or system status.",
            references=[],
            suggested_actions=["Check system status", "View recent alerts"],
            confidence="low"
        )
    
    # Search for relevant alerts based on query
    relevant_alerts = []
    references = []
    
    if "high" in query_lower or "critical" in query_lower:
        relevant_alerts = [a for a in MOCK_ALERTS if a.severity == "high"][:3]
    elif "user" in query_lower or "tok" in query_lower:
        # Extract user ID if present
        for alert in MOCK_ALERTS[:5]:
            if any(word in query_lower for word in [alert.user_id.lower(), "user"]):
                relevant_alerts.append(alert)
    else:
        relevant_alerts = MOCK_ALERTS[:3]
    
    references = [a.alert_id for a in relevant_alerts]
    
    if not relevant_alerts:
        return ChatResponse(
            answer_text="No specific alerts found matching your query, but I am monitoring the system. I can help you analyze logs or check system health.",
            references=[],
            suggested_actions=["View all alerts", "Check system status"],
            confidence="medium"
        )
    
    severity_counts = {"high": 0, "medium": 0, "low": 0}
    for alert in relevant_alerts:
        severity_counts[alert.severity] += 1
    
    answer = f"Based on the system logs, I found {len(relevant_alerts)} relevant alert(s). "
    if severity_counts["high"] > 0:
        answer += f"{severity_counts['high']} are high severity. "
    
    answer += f"The most recent incident ({relevant_alerts[0].alert_id}) involves {relevant_alerts[0].short_text}. "
    answer += "I recommend reviewing these immediately."
    
    suggested_actions = [f"Review {alert.alert_id}" for alert in relevant_alerts[:2]]
    
    return ChatResponse(
        answer_text=answer,
        references=references,
        suggested_actions=suggested_actions,
        confidence="high"
    )

@router.get("/sessions")
async def get_sessions():
    """Get active sessions from alerts"""
    sessions = {}
    for alert in MOCK_ALERTS:
        if alert.session_id not in sessions:
            sessions[alert.session_id] = {
                "session_id": alert.session_id,
                "user_id": alert.user_id,
                "ip": alert.ip,
                "event_count": len(alert.events),
                "last_seen": alert.created_ts,
                "alerts_count": 1
            }
        else:
            sessions[alert.session_id]["alerts_count"] += 1
            if alert.created_ts > sessions[alert.session_id]["last_seen"]:
                sessions[alert.session_id]["last_seen"] = alert.created_ts
    
    return list(sessions.values())

@router.get("/config/email")
async def get_email_config():
    import os
    return {
        "enabled": os.getenv("EMAIL_ALERTS_ENABLED", "false").lower() == "true",
        "recipient": os.getenv("ALERT_RECIPIENT_EMAIL", "")
    }

@router.post("/config/email")
async def update_email_config(body: dict):
    # In production, store this in database
    # For now, just return success
    return {"success": True, "message": "Email configuration updated"}
