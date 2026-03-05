'use client'

import { useMemo } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'
import { signalConfig, signalOrder } from '@/lib/signalConfig'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '12px 16px', minWidth: 180 }}>
            <div style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{label}</div>
            {payload.map((p) => p.value > 0 && (
                <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.stroke, display: 'inline-block' }} />
                    {signalConfig[p.dataKey]?.label || p.dataKey}: <span style={{ color: p.fill || p.stroke, fontWeight: 600 }}>{p.value}</span>
                </div>
            ))}
        </div>
    )
}

export default function HealthTimeline({ logs }) {
    const data = useMemo(() => {
        const byDate = {}
        logs.forEach((log) => {
            if (!byDate[log.date]) byDate[log.date] = {}
            byDate[log.date][log.performance_signal] = (byDate[log.date][log.performance_signal] || 0) + 1
        })
        return Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, counts]) => {
                const row = { date }
                signalOrder.forEach((s) => { row[s] = counts[s] || 0 })
                return row
            })
    }, [logs])

    return (
        <div className="elevated-card p-6 animate-fade-in-up">
            <h3 className="text-base font-semibold mb-6" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                Portfolio Health Over Time
            </h3>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>No data</div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            {signalOrder.map((s) => (
                                <linearGradient key={s} id={`gradient-${s.replace(/[\s/]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={signalConfig[s].color} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={signalConfig[s].color} stopOpacity={0.05} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: 'var(--grid-line)' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(v) => (
                                <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                                    {signalConfig[v]?.label || v}
                                </span>
                            )}
                            iconType="circle"
                            iconSize={8}
                        />
                        {[...signalOrder].reverse().map((s) => (
                            <Area
                                key={s}
                                type="monotone"
                                dataKey={s}
                                name={s}
                                stackId="signals"
                                stroke={signalConfig[s].color}
                                strokeWidth={2}
                                fill={`url(#gradient-${s.replace(/[\s/]/g, '')})`}
                                dot={false}
                                activeDot={{ r: 3, fill: signalConfig[s].color, stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                                isAnimationActive={true}
                                animationDuration={1000}
                                animationEasing="ease-out"
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
