'use client'

import { useMemo } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ReferenceLine, ResponsiveContainer, defs, linearGradient, stop,
} from 'recharts'
import { signalConfig, getHealthScore } from '@/lib/signalConfig'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', minWidth: 180 }}>
            <div style={{ color: '#f1f5f9', fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{label}</div>
            <div style={{ color: '#00e5cc', fontFamily: 'Inter, sans-serif', fontSize: 14, marginBottom: 8 }}>
                Score: {d.score}%
            </div>
            {d.breakdown && Object.entries(d.breakdown).map(([sig, cnt]) => cnt > 0 && (
                <div key={sig} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: signalConfig[sig]?.color, display: 'inline-block' }} />
                    {signalConfig[sig]?.label}: {cnt}
                </div>
            ))}
        </div>
    )
}

export default function HealthTimeline({ logs }) {
    const data = useMemo(() => {
        const byDate = {}
        logs.forEach((log) => {
            if (!byDate[log.date]) byDate[log.date] = []
            byDate[log.date].push(log)
        })
        return Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayLogs]) => {
                const breakdown = {}
                dayLogs.forEach((l) => {
                    breakdown[l.performance_signal] = (breakdown[l.performance_signal] || 0) + 1
                })
                return { date, score: getHealthScore(dayLogs), breakdown }
            })
    }, [logs])

    return (
        <div className="glass-card p-6 animate-fade-in-up">
            <h3 className="text-base font-semibold mb-6" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                Portfolio Health Over Time
            </h3>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-64" style={{ color: '#64748b' }}>No data</div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00e5cc" stopOpacity={0.3} />
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
                        <ReferenceLine
                            y={70}
                            stroke="#f5c842"
                            strokeDasharray="4 4"
                            label={{ value: 'Target', fill: '#f5c842', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#00e5cc"
                            strokeWidth={2.5}
                            fill="url(#healthGradient)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#00e5cc', stroke: '#050505', strokeWidth: 2 }}
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
