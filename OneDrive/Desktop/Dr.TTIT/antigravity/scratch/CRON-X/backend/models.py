from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CursorPoint(BaseModel):
    t: int
    x: int
    y: int

class Event(BaseModel):
    event_id: str
    ts: int
    user_id: str
    session_id: str
    event_type: str
    ip: str
    user_agent: str
    cursor_trace: List[CursorPoint] = []
    keystroke_speed: Optional[int] = None
    raw_log: Optional[str] = None
    enriched: Dict[str, Any] = {}

class StructuredReason(BaseModel):
    tag: str
    weight: float
    detail: str

class Note(BaseModel):
    author: str
    ts: int
    text: str

class AuditLog(BaseModel):
    type: str
    actor: str
    action: str
    ts: int

class Alert(BaseModel):
    alert_id: str
    created_ts: int
    status: str  # open, acknowledged, resolved
    severity: str  # high, medium, low
    anomaly_score: float
    model_scores: Dict[str, float]
    suggested_action: str
    ttl_seconds: Optional[int] = None
    user_id: str
    session_id: str
    ip: str
    events: List[Event] = []
    structured_reasons: List[StructuredReason] = []
    notes: List[Note] = []
    audit: List[AuditLog] = []
    short_text: Optional[str] = None

class ChatQuery(BaseModel):
    actor: str
    query: str
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    answer_text: str
    references: List[str]
    suggested_actions: List[str]
    confidence: str
