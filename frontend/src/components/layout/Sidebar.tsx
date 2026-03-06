import React from 'react';
import { usePlatformStore } from '../../store/platformStore';
import {
    LayoutDashboard, Globe2, BarChart3, Bell, Crosshair, Grid3X3, Settings, Zap,
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#F5C842' },
    { id: 'globe', icon: Globe2, label: 'Globe View', color: '#36D6B5' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', color: '#8B6CF6' },
    { id: 'alerts', icon: Bell, label: 'Alerts', color: '#EF5350' },
    { id: 'simulation', icon: Crosshair, label: 'Simulation', color: '#F067A6' },
    { id: 'correlation', icon: Grid3X3, label: 'Correlation', color: '#5DADE2' },
] as const;

const Sidebar: React.FC = () => {
    const activeView = usePlatformStore((s) => s.activeView);
    const setActiveView = usePlatformStore((s) => s.setActiveView);

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 64,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 50,
                background: 'linear-gradient(180deg, rgba(14, 12, 26, 0.97) 0%, rgba(8, 7, 15, 0.99) 100%)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(80, 60, 160, 0.15)',
                paddingTop: 8,
            }}
        >
            {/* Logo */}
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #F5C842 0%, #E5A820 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    boxShadow: '0 4px 16px rgba(245, 200, 66, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(245, 200, 66, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 200, 66, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                }}
            >
                <Zap size={22} color="#0E0C1A" strokeWidth={2.5} />
            </div>

            {/* Nav */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '0 6px' }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = activeView === item.id;
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="tooltip-container">
                            <button
                                onClick={() => setActiveView(item.id)}
                                style={{
                                    width: '100%',
                                    height: 44,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 10,
                                    border: 'none',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: isActive
                                        ? `linear-gradient(135deg, ${item.color}15, ${item.color}06)`
                                        : 'transparent',
                                    color: isActive ? item.color : '#706B9E',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(139, 108, 246, 0.04)';
                                        e.currentTarget.style.color = '#B0ADCF';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#706B9E';
                                    }
                                }}
                            >
                                {isActive && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: -6,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 3,
                                            height: 20,
                                            borderRadius: '0 3px 3px 0',
                                            background: item.color,
                                            boxShadow: `0 0 10px ${item.color}50`,
                                        }}
                                    />
                                )}
                                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                            </button>
                            <span className="tooltip-text">{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Settings */}
            <div style={{ padding: '12px 6px', width: '100%' }}>
                <div className="tooltip-container">
                    <button
                        style={{
                            width: '100%',
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                            border: 'none',
                            cursor: 'pointer',
                            background: 'transparent',
                            color: '#706B9E',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(139, 108, 246, 0.04)';
                            e.currentTarget.style.color = '#B0ADCF';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#706B9E';
                        }}
                    >
                        <Settings size={18} strokeWidth={1.8} />
                    </button>
                    <span className="tooltip-text">Settings</span>
                </div>
            </div>
        </nav>
    );
};

export default React.memo(Sidebar);
