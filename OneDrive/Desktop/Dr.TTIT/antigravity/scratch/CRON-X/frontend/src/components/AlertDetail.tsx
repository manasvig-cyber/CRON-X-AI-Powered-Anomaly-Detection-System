import React, { useState } from 'react';
import { Alert } from '../types';
import { Shield, CheckCircle, XCircle, AlertOctagon, Activity, Terminal, MapPin, User, Globe } from 'lucide-react';
import SessionReplay from './SessionReplay';
import { cn } from '../lib/utils';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

interface AlertDetailProps {
    alert: Alert;
    onUpdate: (updatedAlert: Alert) => void;
}

const AlertDetail: React.FC<AlertDetailProps> = ({ alert, onUpdate }) => {
    const [isAckLoading, setIsAckLoading] = useState(false);
    const [isOverrideLoading, setIsOverrideLoading] = useState(false);

    const handleAck = async () => {
        setIsAckLoading(true);
        try {
            const res = await axios.post(`http://localhost:8000/api/alerts/${alert.alert_id}/ack`, {
                actor: 'analyst_curr',
                note: 'Acknowledged via dashboard'
            });
            onUpdate(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAckLoading(false);
        }
    };

    const handleOverride = async (action: string) => {
        setIsOverrideLoading(true);
        try {
            const res = await axios.post(`http://localhost:8000/api/alerts/${alert.alert_id}/override`, {
                actor: 'analyst_curr',
                action: action,
                reason: 'Manual override'
            });
            onUpdate(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsOverrideLoading(false);
        }
    };

    return (
        <div className="flex h-full gap-6">
            {/* Left Pane: Detail & Replay */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
                {/* Header Card */}
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold">{alert.alert_id}</h2>
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-sm font-bold uppercase tracking-wide",
                                    alert.severity === 'high' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                        alert.severity === 'medium' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                )}>
                                    {alert.severity}
                                </span>
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-sm font-medium border",
                                    alert.status === 'open' ? "bg-muted text-muted-foreground" :
                                        alert.status === 'acknowledged' ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900" :
                                            "bg-gray-100 text-gray-700"
                                )}>
                                    {alert.status}
                                </span>
                            </div>
                            <p className="text-muted-foreground">{alert.short_text}</p>
                        </div>
                        <div className="flex gap-2">
                            {alert.status === 'open' && (
                                <button
                                    onClick={handleAck}
                                    disabled={isAckLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <CheckCircle size={16} />
                                    Acknowledge
                                </button>
                            )}
                            <button
                                onClick={() => handleOverride('rollback')}
                                disabled={isOverrideLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
                            >
                                <XCircle size={16} />
                                Override
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Anomaly Score</div>
                            <div className="text-2xl font-mono font-bold text-primary">{(alert.anomaly_score * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Suggested Action</div>
                            <div className="text-lg font-medium capitalize">{alert.suggested_action.replace('_', ' ')}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Confidence</div>
                            <div className="text-lg font-medium">High</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">TTL</div>
                            <div className="text-lg font-medium">{alert.ttl_seconds ? `${alert.ttl_seconds / 60}m` : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Session Replay */}
                <SessionReplay events={alert.events} />

                {/* Model Evidence */}
                <div className="bg-card border rounded-lg p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Activity size={18} />
                        Model Evidence
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Ensemble Score</span>
                                <span className="font-mono">{alert.model_scores.antigravity}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${alert.model_scores.antigravity * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {alert.structured_reasons.map((reason, idx) => (
                                <div key={idx} className="p-3 bg-muted/50 rounded border border-border">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-sm">{reason.tag}</span>
                                        <span className="text-xs bg-background px-1.5 py-0.5 rounded border">
                                            w: {reason.weight}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{reason.detail}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Raw Logs */}
                <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                        <Terminal size={16} />
                        <h3 className="font-semibold text-sm">Raw Events</h3>
                    </div>
                    <div className="p-0 bg-zinc-950 text-zinc-300 font-mono text-xs overflow-x-auto max-h-64">
                        {alert.events.map((evt, i) => (
                            <div key={i} className="p-2 border-b border-zinc-800 hover:bg-zinc-900">
                                <span className="text-zinc-500 mr-2">[{new Date(evt.ts * 1000).toISOString()}]</span>
                                <span className="text-blue-400 mr-2">{evt.event_type}</span>
                                <span>{JSON.stringify(evt.enriched)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Pane: Context */}
            <div className="w-80 flex flex-col gap-6 shrink-0">
                {/* User Card */}
                <div className="bg-card border rounded-lg p-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">User Context</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            <User size={20} />
                        </div>
                        <div>
                            <div className="font-bold">{alert.user_id}</div>
                            <div className="text-xs text-muted-foreground">Last seen: Just now</div>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-border/50">
                            <span className="text-muted-foreground">Role</span>
                            <span>Admin</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/50">
                            <span className="text-muted-foreground">Department</span>
                            <span>Engineering</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/50">
                            <span className="text-muted-foreground">Risk Score</span>
                            <span className="text-amber-600 font-bold">Medium</span>
                        </div>
                    </div>
                </div>

                {/* IP Card */}
                <div className="bg-card border rounded-lg p-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Network Context</h3>
                    <div className="flex items-center gap-2 mb-2">
                        <Globe size={16} className="text-muted-foreground" />
                        <span className="font-mono font-medium">{alert.ip}</span>
                    </div>
                    <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center text-muted-foreground text-xs">
                        [Map Thumbnail Placeholder]
                    </div>
                    <div className="text-xs space-y-1">
                        <div className="flex gap-2">
                            <span className="text-muted-foreground w-8">ASN:</span>
                            <span className="font-mono">AS12345</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-muted-foreground w-8">Geo:</span>
                            <span>San Francisco, US</span>
                        </div>
                    </div>
                </div>

                {/* Playbook */}
                <div className="bg-card border rounded-lg p-4 flex-1">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recommended Playbook</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" />
                            <span className="text-sm">Verify user identity via 2FA</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" />
                            <span className="text-sm">Check for concurrent sessions</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <input type="checkbox" className="mt-1" />
                            <span className="text-sm">Review recent API calls</span>
                        </div>
                        <button className="w-full mt-4 py-2 bg-secondary text-secondary-foreground rounded text-sm font-medium hover:bg-secondary/80">
                            Run Automated Checks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertDetail;
