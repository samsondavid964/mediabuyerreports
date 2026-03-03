'use client'

import { useMemo } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceDot,
} from 'recharts'
import { getHealthScore, signalConfig } from '@/lib/signalConfig'
import { isSubstantive } from '@/lib/signalConfig'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    const cfg = signalConfig[d.signal] || {}
    return (
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', maxWidth: 280 }}>
            <div style={{ color: '#f1f5f9', fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                <span style={{ color: cfg.color, fontSize: 12 }}>{cfg.label}</span>
                <span style={{ color: '#00e5cc', fontFamily: 'Inter, sans-serif', fontSize: 14, marginLeft: 'auto', fontWeight: 700 }}>{d.score}%</span>
            </div>
            {isSubstantive(d.accountChanges) && (
                <div style={{ fontSize: 11, color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>
                    <span style={{ color: '#64748b' }}>Changes: </span>
                    {d.accountChanges}
                </div>
            )}
        </div>
    )
}

export default function ClientTimeline({ logs }) {
    const data = useMemo(() => {
        return [...logs]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((log) => ({
                date: log.date,
                score: signalConfig[log.performance_signal]?.score ?? 50,
                signal: log.performance_signal,
                accountChanges: log.account_changes,
                hasChanges: isSubstantive(log.account_changes),
            }))
    }, [logs])

    return (
        <div className="glass-card p-6 animate-fade-in-up">
            <h3 className="text-base font-semibold mb-6" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                Health Timeline
                <span className="text-xs ml-2" style={{ color: '#64748b' }}>● annotated with account changes</span>
            </h3>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-64" style={{ color: '#64748b' }}>No data for this client</div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="clientGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00e5cc" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#00e5cc" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.04)' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fill: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#00e5cc"
                            strokeWidth={2.5}
                            dot={(props) => {
                                const { cx, cy, payload } = props
                                if (payload.hasChanges) {
                                    return (
                                        <circle
                                            key={`dot-${payload.date}`}
                                            cx={cx} cy={cy} r={6}
                                            fill="#f5c842" stroke="#050505" strokeWidth={2}
                                        />
                                    )
                                }
                                return (
                                    <circle
                                        key={`dot-${payload.date}`}
                                        cx={cx} cy={cy} r={3}
                                        fill="#00e5cc" stroke="#050505" strokeWidth={1.5}
                                    />
                                )
                            }}
                            activeDot={{ r: 5, fill: '#00e5cc', stroke: '#050505', strokeWidth: 2 }}
                            isAnimationActive={true}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
            <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5cc' }} />
                    <span style={{ fontSize: 11, color: '#64748b' }}>Daily signal</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5c842' }} />
                    <span style={{ fontSize: 11, color: '#64748b' }}>Account change day</span>
                </div>
            </div>
        </div>
    )
}
