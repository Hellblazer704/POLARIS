import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlatformStore } from '../../store/platformStore';
import { topicColors } from '../../design-system';
import type { Topic } from '../../types';

const TOPICS: Topic[] = ['Economy', 'Security', 'Healthcare', 'Infrastructure', 'Governance', 'Identity'];

function computeCorrelation(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length);
    if (n < 2) return 0;
    const meanA = a.reduce((s, v) => s + v, 0) / n;
    const meanB = b.reduce((s, v) => s + v, 0) / n;
    let num = 0, denA = 0, denB = 0;
    for (let i = 0; i < n; i++) {
        const da = a[i] - meanA;
        const db = b[i] - meanB;
        num += da * db;
        denA += da * da;
        denB += db * db;
    }
    const den = Math.sqrt(denA * denB);
    return den === 0 ? 0 : num / den;
}

function corrColor(v: number): string {
    if (v > 0.5) return '#FFB300';
    if (v > 0.2) return 'rgba(255,179,0,0.5)';
    if (v > -0.2) return '#1A2E4A';
    if (v > -0.5) return 'rgba(239,83,80,0.5)';
    return '#EF5350';
}

const CorrelationMatrix: React.FC = () => {
    const constituencies = usePlatformStore((s) => s.constituencies);
    const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

    // Compute correlation matrix from topic salience across constituencies
    const matrix = useMemo(() => {
        const keys = Object.keys(constituencies);
        const topicVecs: Record<string, number[]> = {};
        TOPICS.forEach((t) => {
            topicVecs[t] = keys.map((k) => constituencies[k]?.topic_salience?.[t] || 0);
        });

        return TOPICS.map((t1) =>
            TOPICS.map((t2) => {
                if (t1 === t2) return 1.0;
                return parseFloat(computeCorrelation(topicVecs[t1], topicVecs[t2]).toFixed(2));
            })
        );
    }, [constituencies]);

    const cellSize = 72;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 24 }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F0F4FA' }}>Topic Correlation Matrix</h1>
                <p style={{ fontSize: 13, color: '#546E7A', marginTop: 4 }}>
                    Cross-correlation of topic salience values across all constituencies
                </p>
            </div>

            {/* Matrix */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                    {/* Column headers */}
                    <div style={{ display: 'flex', marginLeft: cellSize + 8 }}>
                        {TOPICS.map((t) => (
                            <div
                                key={t}
                                style={{
                                    width: cellSize,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    paddingBottom: 4,
                                }}
                            >
                                <span style={{ fontSize: 10, fontWeight: 600, color: topicColors[t], transform: 'rotate(-25deg)', transformOrigin: 'bottom center', whiteSpace: 'nowrap' }}>
                                    {t}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {TOPICS.map((rowTopic, r) => (
                        <div key={rowTopic} style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Row label */}
                            <div style={{ width: cellSize + 8, textAlign: 'right', paddingRight: 12 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: topicColors[rowTopic] }}>
                                    {rowTopic}
                                </span>
                            </div>

                            {/* Cells */}
                            {TOPICS.map((colTopic, c) => {
                                const val = matrix[r][c];
                                const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
                                const isDiag = r === c;
                                return (
                                    <motion.div
                                        key={colTopic}
                                        style={{
                                            width: cellSize,
                                            height: cellSize,
                                            background: isDiag ? '#0B1829' : corrColor(val),
                                            border: `1px solid ${isHovered ? '#FFB300' : '#1E3A5F'}`,
                                            borderRadius: 4,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            margin: 1,
                                        }}
                                        onMouseEnter={() => setHoveredCell({ r, c })}
                                        onMouseLeave={() => setHoveredCell(null)}
                                        animate={{ background: isDiag ? '#0B1829' : corrColor(val) }}
                                        transition={{ duration: 0.6 }}
                                        whileHover={{ scale: 1.08, zIndex: 10 }}
                                    >
                                        <span className="mono" style={{
                                            fontSize: isDiag ? 10 : 16,
                                            fontWeight: 700,
                                            color: isDiag ? '#546E7A' : (Math.abs(val) > 0.3 ? '#F0F4FA' : '#90A4AE'),
                                        }}>
                                            {isDiag ? '1.00' : val.toFixed(2)}
                                        </span>

                                        {/* Tooltip on hover */}
                                        {isHovered && !isDiag && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: -40,
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: '#0F2040',
                                                    border: '1px solid #1E3A5F',
                                                    borderRadius: 6,
                                                    padding: '4px 10px',
                                                    whiteSpace: 'nowrap',
                                                    fontSize: 10,
                                                    color: '#F0F4FA',
                                                    zIndex: 20,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                                }}
                                            >
                                                When {rowTopic} rises, {colTopic} {val >= 0 ? 'also rises' : 'falls'} ({val > 0 ? '+' : ''}{val.toFixed(2)})
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Legend */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                        <span style={{ fontSize: 10, color: '#EF5350' }}>−1.0</span>
                        <div style={{
                            width: 200,
                            height: 10,
                            borderRadius: 5,
                            background: 'linear-gradient(to right, #EF5350, rgba(239,83,80,0.5), #1A2E4A, rgba(255,179,0,0.5), #FFB300)',
                        }} />
                        <span style={{ fontSize: 10, color: '#FFB300' }}>+1.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CorrelationMatrix);
