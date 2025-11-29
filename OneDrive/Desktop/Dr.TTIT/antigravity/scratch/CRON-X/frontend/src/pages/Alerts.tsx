import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Alert } from '../types';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';

const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const params = filter !== 'all' ? { severity: filter } : {};
                const res = await axios.get('http://localhost:8000/api/alerts', { params });
                setAlerts(res.data);
            } catch (e) {
                console.error("Failed to fetch alerts", e);
            }
        };
        fetchAlerts();
    }, [filter]);

    const filteredAlerts = alerts.filter(a =>
        statusFilter === 'all' || a.status === statusFilter
    );

    return (
        <Layout>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">All Alerts</h1>
                    <div className="flex gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All Severities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        {filteredAlerts.map((alert) => (
                            <div
                                key={alert.alert_id}
                                className={cn(
                                    "p-4 bg-card border rounded-lg hover:shadow-md transition-all cursor-pointer",
                                    alert.severity === 'high' ? "border-red-500/20 hover:border-red-500/40" :
                                        alert.severity === 'medium' ? "border-amber-500/20 hover:border-amber-500/40" :
                                            "border-blue-500/20 hover:border-blue-500/40"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle
                                            className={cn(
                                                alert.severity === 'high' ? "text-red-500" :
                                                    alert.severity === 'medium' ? "text-amber-500" :
                                                        "text-blue-500"
                                            )}
                                            size={20}
                                        />
                                        <div>
                                            <div className="font-bold">{alert.alert_id}</div>
                                            <div className="text-sm text-muted-foreground">{alert.short_text}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                                            alert.severity === 'high' ? "bg-red-500 text-white" :
                                                alert.severity === 'medium' ? "bg-amber-500 text-white" :
                                                    "bg-blue-500 text-white"
                                        )}>
                                            {alert.severity}
                                        </span>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                            alert.status === 'open' ? "bg-muted text-muted-foreground" :
                                                alert.status === 'acknowledged' ? "bg-green-100 text-green-700" :
                                                    "bg-gray-100 text-gray-700"
                                        )}>
                                            {alert.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                    <div>
                                        <div className="text-muted-foreground text-xs">User</div>
                                        <div className="font-mono">{alert.user_id}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground text-xs">IP Address</div>
                                        <div className="font-mono">{alert.ip}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground text-xs">Score</div>
                                        <div className="font-bold text-primary">{(alert.anomaly_score * 100).toFixed(0)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground text-xs">Time</div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDistanceToNow(alert.created_ts * 1000, { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Alerts;
