'use client'

import { useMemo } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'
import { signalConfig, signalOrder } from '@/lib/signalConfig'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ color: '#f1f5f9', fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{label}</div>
            {payload.map((p) => (
                <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: p.fill, display: 'inline-block' }} />
                    {p.name}: <span style={{ color: p.fill, fontWeight: 600 }}>{p.value}</span>
                </div>
            ))}
        </div>
    )
}

function getWeekLabel(date) {
    const d = new Date(date)
    d.setDate(d.getDate() - d.getDay())
    return d.toISOString().split('T')[0]
}

export default function SignalStackedBar({ logs, dateRange }) {
    const data = useMemo(() => {
        const dayCount = (new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)
        const useWeeks = dayCount > 30
        const grouped = {}
        logs.forEach((log) => {
            const key = useWeeks ? getWeekLabel(log.date) : log.date
            if (!grouped[key]) grouped[key] = {}
            grouped[key][log.performance_signal] = (grouped[key][log.performance_signal] || 0) + 1
        })
        return Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, counts]) => ({ date: key, ...counts }))
    }, [logs, dateRange])

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-base font-semibold mb-6" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                Signal Distribution Over Time
            </h3>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-64" style={{ color: '#64748b' }}>No data</div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.04)' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(v) => (
                                <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                                    {signalConfig[v]?.label || v}
                                </span>
                            )}
                            iconType="rect"
                            iconSize={10}
                        />
                        {signalOrder.map((s) => (
                            <Bar
                                key={s}
                                dataKey={s}
                                name={s}
                                stackId="a"
                                fill={signalConfig[s].color}
                                radius={s === signalOrder[0] ? [0, 0, 3, 3] : s === signalOrder[signalOrder.length - 1] ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                                maxBarSize={48}
                                isAnimationActive={true}
                                animationDuration={800}
                                animationEasing="ease-out"
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
