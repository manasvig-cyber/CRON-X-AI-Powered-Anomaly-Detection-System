import React from 'react';
import Layout from '../components/Layout';
import { BookOpen, Play } from 'lucide-react';

const Playbooks: React.FC = () => {
    const playbooks = [
        {
            id: 1,
            name: 'High-Risk Login Investigation',
            description: 'Standard procedure for investigating suspicious login attempts',
            steps: [
                'Verify user identity via 2FA',
                'Check for concurrent sessions',
                'Review recent API calls',
                'Analyze login location history',
                'Contact user if necessary'
            ],
            category: 'Authentication'
        },
        {
            id: 2,
            name: 'Data Exfiltration Response',
            description: 'Immediate response to potential data breach',
            steps: [
                'Isolate affected systems',
                'Block suspicious IP addresses',
                'Review data access logs',
                'Notify security team',
                'Document incident timeline'
            ],
            category: 'Data Security'
        },
        {
            id: 3,
            name: 'Anomalous API Usage',
            description: 'Investigation of unusual API patterns',
            steps: [
                'Identify API endpoints accessed',
                'Check rate limiting violations',
                'Review payload contents',
                'Validate API key ownership',
                'Implement temporary throttling'
            ],
            category: 'API Security'
        }
    ];

    return (
        <Layout>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">SOC Playbooks</h1>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2">
                        <BookOpen size={18} />
                        Create Playbook
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-4">
                        {playbooks.map((playbook) => (
                            <div key={playbook.id} className="p-5 bg-card border border-border rounded-lg hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <BookOpen className="text-primary" size={20} />
                                            <h3 className="text-xl font-bold">{playbook.name}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{playbook.description}</p>
                                        <div className="mt-2">
                                            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded">
                                                {playbook.category}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 flex items-center gap-2">
                                        <Play size={16} />
                                        Run Playbook
                                    </button>
                                </div>

                                <div className="mt-4 pl-4 border-l-2 border-border">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Steps ({playbook.steps.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {playbook.steps.map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm">
                                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <span>{step}</span>
                                            </div>
                                        ))}
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

export default Playbooks;
