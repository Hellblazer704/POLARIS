import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatformStore } from '../../store/platformStore';
import { sentimentColor, statusColor, topicColors } from '../../design-system';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import type { Topic } from '../../types';

const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];

const ConstituencyCard: React.FC<{ name: string }> = ({ name }) => {
    const c = usePlatformStore((s) => s.constituencies[name]);
    if (!c) return null;

    const sColor = sentimentColor(c.s);
    const siColor = statusColor(c.stability_index);
    const isCrisis = c.stability_index < 0.3;

    return (
        <motion.div
            layout
            className={`card ${isCrisis ? 'crisis-pulse' : ''}`}
            style={{ padding: 14, marginBottom: 8 }}
            whileHover={{ y: -2 }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#F0F4FA' }}>{c.name}</span>
                <span className={`badge badge-amber`} style={{ fontSize: 10 }}>T{c.tier}</span>
            </div>

            {/* Reception position */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                <motion.span
                    className="mono"
                    style={{ fontSize: 24, fontWeight: 700, color: sColor }}
                    key={c.s}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    {c.s > 0 ? '+' : ''}{c.s.toFixed(3)}
                </motion.span>

                {/* Velocity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {c.velocity >= 0 ? (
                        <ArrowUp size={12} color="#4CAF50" />
                    ) : (
                        <ArrowDown size={12} color="#EF5350" />
                    )}
                    <span className="mono" style={{ fontSize: 11, color: '#90A4AE' }}>
                        {c.velocity >= 0 ? '+' : ''}{c.velocity.toFixed(4)}
                    </span>
                </div>

                {/* Acceleration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {c.acceleration >= 0 ? (
                        <ChevronsUp size={12} color="#4CAF50" />
                    ) : (
                        <ChevronsDown size={12} color="#EF5350" />
                    )}
                    <span className="mono" style={{ fontSize: 11, color: '#546E7A' }}>
                        {c.acceleration >= 0 ? '+' : ''}{c.acceleration.toFixed(4)}
                    </span>
                </div>
            </div>

            {/* Volatility bar */}
            <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: '#546E7A' }}>Σ(t) Volatility</span>
                    <span className="mono" style={{ fontSize: 10, color: '#90A4AE' }}>{c.volatility.toFixed(4)}</span>
                </div>
                <div style={{ height: 3, background: '#1A2E4A', borderRadius: 2 }}>
                    <motion.div
                        style={{
                            height: '100%',
                            background: c.volatility > 0.08 ? '#EF5350' : '#FFB300',
                            borderRadius: 2,
                        }}
                        animate={{ width: `${Math.min(100, c.volatility * 500)}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                </div>
            </div>

            {/* Stability Index ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <svg width={32} height={32} viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#1A2E4A" strokeWidth="3" />
                    <motion.circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke={siColor}
                        strokeWidth="3"
                        strokeDasharray={`${c.stability_index * 94.2} 94.2`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                        initial={false}
                        animate={{ strokeDasharray: `${c.stability_index * 94.2} 94.2` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                    <text x="18" y="20" textAnchor="middle" fontSize="8" fontWeight="700" fill={siColor} fontFamily="'JetBrains Mono'">
                        {(c.stability_index * 100).toFixed(0)}
                    </text>
                </svg>
                <span style={{ fontSize: 10, color: '#546E7A' }}>SI</span>

                {/* Topic salience mini bar */}
                <div style={{ flex: 1, height: 8, display: 'flex', borderRadius: 4, overflow: 'hidden' }}>
                    {TOPICS.map((t) => (
                        <motion.div
                            key={t}
                            style={{
                                background: topicColors[t],
                                height: '100%',
                            }}
                            animate={{ width: `${(c.topic_salience[t] || 0) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                            title={`${t}: ${((c.topic_salience[t] || 0) * 100).toFixed(1)}%`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const StatePanel: React.FC = () => {
    const constituencies = usePlatformStore((s) => s.constituencies);
    const keys = useMemo(() => Object.keys(constituencies), [constituencies]);

    return (
        <div className="card-glass" style={{ padding: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', color: '#90A4AE', textTransform: 'uppercase' }}>
                    Live State Vector X(t)
                </h2>
                <span className="badge badge-teal" style={{ fontSize: 10 }}>LIVE</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
                <AnimatePresence>
                    {keys.map((key) => (
                        <ConstituencyCard key={key} name={key} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default React.memo(StatePanel);
