import random
import time
import uuid
from typing import List
from .models import Alert, Event, CursorPoint, StructuredReason, Note, AuditLog

def generate_cursor_trace(duration_ms: int = 5000) -> List[CursorPoint]:
    points = []
    t = 0
    x, y = random.randint(100, 800), random.randint(100, 600)
    while t < duration_ms:
        points.append(CursorPoint(t=t, x=x, y=y))
        t += random.randint(20, 100)
        x += random.randint(-20, 20)
        y += random.randint(-20, 20)
        # Clamp
        x = max(0, min(1000, x))
        y = max(0, min(800, y))
    return points

def generate_event(user_id: str, session_id: str) -> Event:
    ts = int(time.time())
    event_type = random.choice(["cursor_move", "keystroke", "login", "api_call", "failed_auth"])
    
    trace = []
    if event_type == "cursor_move":
        trace = generate_cursor_trace()
    
    return Event(
        event_id=f"evt_{uuid.uuid4().hex[:8]}",
        ts=ts,
        user_id=user_id,
        session_id=session_id,
        event_type=event_type,
        ip=f"203.0.{random.randint(1, 255)}.{random.randint(1, 255)}",
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
        cursor_trace=trace,
        keystroke_speed=random.randint(200, 500) if event_type == "keystroke" else None,
        raw_log=f"USER:{user_id}|TS:{ts}|TYPE:{event_type}",
        enriched={"geo": random.choice(["US", "IN", "DE", "JP"]), "asn": f"AS{random.randint(1000, 9999)}"}
    )

def generate_alert() -> Alert:
    ts = int(time.time())
    user_id = f"tok_{random.randint(10, 99)}"
    session_id = f"sess_{uuid.uuid4().hex[:6]}"
    severity = random.choice(["high", "medium", "low"])
    
    # Generate some events
    events = [generate_event(user_id, session_id) for _ in range(random.randint(3, 10))]
    
    return Alert(
        alert_id=f"ALERT_{uuid.uuid4().hex[:6].upper()}",
        created_ts=ts,
        status="open",
        severity=severity,
        anomaly_score=round(random.uniform(0.5, 0.99), 2),
        model_scores={"local": round(random.uniform(0.4, 0.8), 2), "antigravity": round(random.uniform(0.7, 0.99), 2)},
        suggested_action=random.choice(["temp_block", "block_ip", "revoke_session", "alert", "none"]),
        ttl_seconds=1800 if severity == "high" else None,
        user_id=user_id,
        session_id=session_id,
        ip=events[0].ip,
        events=events,
        structured_reasons=[
            StructuredReason(tag="new_asn", weight=0.45, detail="Access from previously unseen ASN"),
            StructuredReason(tag="rapid_keystrokes", weight=0.3, detail="Keystroke dynamics anomaly")
        ],
        notes=[],
        audit=[],
        short_text=f"{random.choice(['Login', 'API Call', 'Access'])} from {events[0].enriched.get('geo')} + anomaly"
    )

# Start with empty alerts - they will be generated in real-time
MOCK_ALERTS: List[Alert] = []
