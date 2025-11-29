import React from 'react';
import Layout from '../components/Layout';
import { User, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AuditLog: React.FC = () => {
    const auditLogs = [
        {
            id: 1,
            timestamp: Date.now() - 1000 * 60 * 5,
            actor: 'analyst_jane',
            action: 'acknowledged_alert',
            target: 'ALERT_123',
            result: 'success',
            details: 'Alert acknowledged for investigation'
        },
        {
            id: 2,
            timestamp: Date.now() - 1000 * 60 * 15,
            actor: 'system',
            action: 'blocked_ip',
            target: '203.0.113.5',
            result: 'success',
            details: 'Temporary block applied (TTL: 1800s)'
        },
        {
            id: 3,
            timestamp: Date.now() - 1000 * 60 * 32,
            actor: 'analyst_john',
            action: 'override_block',
            target: '198.51.100.22',
            result: 'success',
            details: 'Manual override - false positive'
        },
        {
            id: 4,
            timestamp: Date.now() - 1000 * 60 * 45,
            actor: 'system',
            action: 'generated_alert',
            target: 'ALERT_456',
            result: 'success',
            details: 'High severity alert created'
        },
        {
            id: 5,
            timestamp: Date.now() - 1000 * 60 * 67,
            actor: 'analyst_jane',
            action: 'revoked_session',
            target: 'sess_abc123',
            result: 'success',
            details: 'Session terminated due to suspicious activity'
        }
    ];

    const getActionIcon = (action: string) => {
        if (action.includes('block')) return <Shield className="text-red-500" size={16} />;
        if (action.includes('acknowledged')) return <CheckCircle className="text-green-500" size={16} />;
        if (action.includes('override')) return <XCircle className="text-amber-500" size={16} />;
        return <AlertCircle className="text-blue-500" size={16} />;
    };

    return (
        <Layout>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Audit Log</h1>
                    <div className="flex gap-2">
                        <select className="px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none">
                            <option>All Actions</option>
                            <option>Blocks</option>
                            <option>Acknowledgments</option>
                            <option>Overrides</option>
                        </select>
                        <select className="px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none">
                            <option>Last 24 hours</option>
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-2">
                        {auditLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-4 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3 flex-1">
                                        <div className="mt-1">
                                            {getActionIcon(log.action)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-sm font-bold">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                                                <span className="text-xs text-muted-foreground">→</span>
                                                <span className="font-mono text-sm text-primary">{log.target}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-2">{log.details}</div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User size={12} />
                                                    {log.actor}
                                                </div>
                                                <div>
                                                    {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle size={12} className="text-green-500" />
                                                    {log.result}
                                                </div>
                                            </div>
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

export default AuditLog;
