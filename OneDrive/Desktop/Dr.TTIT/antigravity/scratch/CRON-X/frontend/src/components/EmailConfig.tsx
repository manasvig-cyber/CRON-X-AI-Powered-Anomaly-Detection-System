import React, { useState, useEffect } from 'react';
import { Mail, X, Save } from 'lucide-react';
import axios from 'axios';

interface EmailConfigProps {
    onClose: () => void;
}

const EmailConfig: React.FC<EmailConfigProps> = ({ onClose }) => {
    const [enabled, setEnabled] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/config/email');
                setEnabled(res.data.enabled);
                setRecipient(res.data.recipient);
            } catch (e) {
                console.error("Failed to fetch email config", e);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('http://localhost:8000/api/config/email', {
                enabled,
                recipient
            });
            alert('Email configuration saved! Note: To fully enable email alerts, configure SMTP settings in backend environment variables.');
            onClose();
        } catch (e) {
            alert('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Mail className="text-primary" size={24} />
                        <h2 className="text-xl font-bold">Email Alert Configuration</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <label htmlFor="email-enabled" className="font-medium">
                            Enable Email Alerts
                        </label>
                        <input
                            id="email-enabled"
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="w-5 h-5 accent-primary"
                        />
                    </div>

                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium mb-2">
                            Alert Recipient Email
                        </label>
                        <input
                            id="recipient"
                            type="email"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="security@example.com"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-sm">
                        <p className="text-blue-800 dark:text-blue-300">
                            <strong>Note:</strong> Email alerts for high-severity incidents will be sent automatically.
                            Configure SMTP settings in backend environment variables for full functionality.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailConfig;
