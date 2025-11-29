export interface CursorPoint {
    t: number;
    x: number;
    y: number;
}

export interface Event {
    event_id: string;
    ts: number;
    user_id: string;
    session_id: string;
    event_type: string;
    ip: string;
    user_agent: string;
    cursor_trace: CursorPoint[];
    keystroke_speed?: number;
    raw_log?: string;
    enriched: Record<string, any>;
}

export interface StructuredReason {
    tag: string;
    weight: number;
    detail: string;
}

export interface Note {
    author: string;
    ts: number;
    text: string;
}

export interface AuditLog {
    type: string;
    actor: string;
    action: string;
    ts: number;
}

export interface Alert {
    alert_id: string;
    created_ts: number;
    status: 'open' | 'acknowledged' | 'resolved';
    severity: 'high' | 'medium' | 'low';
    anomaly_score: number;
    model_scores: Record<string, number>;
    suggested_action: string;
    ttl_seconds?: number;
    user_id: string;
    session_id: string;
    ip: string;
    events: Event[];
    structured_reasons: StructuredReason[];
    notes: Note[];
    audit: AuditLog[];
    short_text?: string;
}

export interface ChatResponse {
    answer_text: string;
    references: string[];
    suggested_actions: string[];
    confidence: string;
}
