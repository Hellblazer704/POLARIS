import React, { useMemo, useState } from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';
import { usePlatformStore } from '../../store/platformStore';

const LINE_COLORS = ['#FFB300', '#00897B', '#1565C0', '#AB47BC', '#EF5350'];

const HistoryPanel: React.FC = () => {
    const history = usePlatformStore((s) => s.history);
    const constituencies = usePlatformStore((s) => s.constituencies);
    const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

    const keys = useMemo(() => Object.keys(history), [history]);

    const chartData = useMemo(() => {
        const data: Record<string, number | string>[] = [];
        for (let i = 0; i < 24; i++) {
            const point: Record<string, number | string> = {
                time: `${String(i * 30 >= 60 ? Math.floor(i * 30 / 60) : 0).padStart(2, '0')}:${String(i * 30 % 60).padStart(2, '0')}`,
            };
            keys.forEach((k) => {
                point[k] = history[k]?.[i] ?? 0;
            });
            data.push(point);
        }
        return data;
    }, [history, keys]);

    const toggleLine = (key: string) => {
        setHiddenLines((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className="card-glass" style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', color: '#90A4AE', textTransform: 'uppercase', marginBottom: 8 }}>
                State Trajectory — Last 24 Steps (12 Hours)
            </h2>

            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1A2E4A" />
                        <XAxis
                            dataKey="time"
                            stroke="#546E7A"
                            fontSize={10}
                            fontFamily="'JetBrains Mono'"
                            tickLine={false}
                        />
                        <YAxis
                            domain={[-1, 1]}
                            stroke="#546E7A"
                            fontSize={10}
                            fontFamily="'JetBrains Mono'"
                            tickLine={false}
                            ticks={[-1, -0.5, -0.3, 0, 0.3, 0.5, 1]}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#0F2040',
                                border: '1px solid #1E3A5F',
                                borderRadius: 8,
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono'",
                            }}
                            labelStyle={{ color: '#90A4AE' }}
                        />
                        <ReferenceLine y={0} stroke="#F0F4FA" strokeDasharray="4 4" strokeWidth={1} opacity={0.3} />
                        <ReferenceLine y={-0.3} stroke="#EF5350" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} label={{ value: 'Crisis', fill: '#EF5350', fontSize: 9 }} />

                        {keys.map((key, i) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                hide={hiddenLines.has(key)}
                                name={constituencies[key]?.name || key}
                                animationDuration={1500}
                                animationEasing="ease-in-out"
                            />
                        ))}

                        <Legend
                            iconType="line"
                            wrapperStyle={{ fontSize: 11, color: '#90A4AE', cursor: 'pointer' }}
                            onClick={(e) => {
                                if (e.dataKey && typeof e.dataKey === 'string') toggleLine(e.dataKey);
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default React.memo(HistoryPanel);
