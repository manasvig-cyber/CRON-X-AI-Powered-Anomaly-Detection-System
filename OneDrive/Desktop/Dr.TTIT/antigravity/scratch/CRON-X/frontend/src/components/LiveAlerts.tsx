import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Alert } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface LiveAlertsProps {
    alerts: Alert[];
    onSelect: (alert: Alert) => void;
}

const LiveAlerts: React.FC<LiveAlertsProps> = ({ alerts, onSelect }) => {
    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Live Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {alerts.slice(0, 3).map((alert) => (
                    <div
                        key={alert.alert_id}
                        onClick={() => onSelect(alert)}
                        className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md active:scale-[0.98]",
                            alert.severity === 'high' ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40" :
                                alert.severity === 'medium' ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" :
                                    "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className={cn(
                                "px-2 py-0.5 rounded text-xs font-bold uppercase",
                                alert.severity === 'high' ? "bg-red-500 text-white" :
                                    alert.severity === 'medium' ? "bg-amber-500 text-white" :
                                        "bg-blue-500 text-white"
                            )}>
                                {alert.severity}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <Clock size={12} className="mr-1" />
                                {formatDistanceToNow(alert.created_ts * 1000, { addSuffix: true })}
                            </div>
                        </div>
                        <div className="font-medium text-sm line-clamp-2 mb-2">
                            {alert.short_text || "Anomaly detected"}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Score: {(alert.anomaly_score * 100).toFixed(0)}%</span>
                            <span>{alert.ip}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveAlerts;
