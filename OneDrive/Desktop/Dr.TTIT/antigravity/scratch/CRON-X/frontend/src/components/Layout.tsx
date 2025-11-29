import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, PlayCircle, BookOpen, MessageSquare, Settings, FileText, Shield, Search, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 overflow-hidden font-sans">
            {/* Sidebar with Glassmorphism */}
            <aside className="w-64 glass border-r border-white/20 flex flex-col relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 pointer-events-none" />

                <div className="relative z-10 p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 animate-pulse-slow" />
                        <Shield className="w-8 h-8 text-blue-500 relative z-10" />
                    </div>
                    <div>
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            CRON-X
                        </span>
                        <p className="text-xs text-muted-foreground">SOC Dashboard</p>
                    </div>
                </div>

                <nav className="relative z-10 flex-1 p-4 space-y-1">
                    <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" active={location.pathname === '/'} />
                    <NavItem to="/alerts" icon={<Bell />} label="Alerts" active={location.pathname === '/alerts'} />
                    <NavItem to="/sessions" icon={<PlayCircle />} label="Sessions" active={location.pathname === '/sessions'} />
                    <NavItem to="/playbooks" icon={<BookOpen />} label="Playbooks" active={location.pathname === '/playbooks'} />
                    <NavItem to="/chatbot" icon={<MessageSquare />} label="Chatbot" active={location.pathname === '/chatbot'} />
                    <NavItem to="/audit-log" icon={<FileText />} label="Audit Log" active={location.pathname === '/audit-log'} />
                </nav>

                <div className="relative z-10 p-4 border-t border-white/10">
                    <NavItem to="/settings" icon={<Settings />} label="Settings" active={location.pathname === '/settings'} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header with gradient and glassmorphism */}
                <header className="h-16 glass border-b border-white/20 flex items-center justify-between px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium shadow-lg shadow-green-500/20">
                            <Activity className="w-4 h-4 animate-pulse" />
                            System Active
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search incidents..."
                                className="pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 transition-all"
                            />
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page Content with subtle pattern */}
                <div className="flex-1 overflow-auto p-6 relative">
                    <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))] pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) => (
    <Link
        to={to}
        className={cn(
            "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
            active
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
        )}
    >
        {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 animate-pulse-slow" />
        )}
        <div className="relative z-10 flex items-center gap-3 w-full">
            {React.cloneElement(icon as React.ReactElement, {
                size: 18,
                className: active ? '' : 'group-hover:scale-110 transition-transform'
            })}
            <span className="flex-1 text-left">{label}</span>
        </div>
    </Link>
);

export default Layout;
