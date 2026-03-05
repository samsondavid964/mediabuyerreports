'use client'

import { useMemo, useState } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'
import { signalConfig, signalOrder } from '@/lib/signalConfig'

const COLORS = [
    '#00e5cc', '#f5c842', '#4ade80', '#ff4d6d', '#00b4d8',
    '#a78bfa', '#fb923c', '#38bdf8', '#f472b6', '#86efac',
]

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '12px 16px', maxWidth: 240 }}>
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

export default function ClientTrends({ logs }) {
    const allClients = useMemo(() => {
        const counts = {}
        logs.forEach((l) => { counts[l.client_name] = (counts[l.client_name] || 0) + 1 })
        return Object.keys(counts).sort((a, b) => a.localeCompare(b))
    }, [logs])

    const [selectedClient, setSelectedClient] = useState('')

    // Filter logs by selected client (or all if none selected)
    const filteredLogs = useMemo(() => {
        if (!selectedClient) return logs
        return logs.filter((l) => l.client_name === selectedClient)
    }, [logs, selectedClient])

    // Aggregate into stacked area chart data (signal counts per date)
    const data = useMemo(() => {
        const byDate = {}
        filteredLogs.forEach((log) => {
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
    }, [filteredLogs])

    return (
        <div className="elevated-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <h3 className="text-base font-semibold flex-shrink-0" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    Client Health Trends
                    {selectedClient && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--accent-teal-bg)', color: 'var(--accent-teal)' }}>
                            {selectedClient}
                        </span>
                    )}
                </h3>
                <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-sm transition-all duration-300"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: 160,
                    }}
                >
                    <option value="" style={{ background: 'var(--bg-surface)' }}>All Clients (Overall Health)</option>
                    {allClients.map((c) => (
                        <option key={c} value={c} style={{ background: 'var(--bg-surface)' }}>{c}</option>
                    ))}
                </select>
            </div>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>No data</div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            {signalOrder.map((s) => (
                                <linearGradient key={s} id={`ct-gradient-${s.replace(/[\s/]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
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
                                fill={`url(#ct-gradient-${s.replace(/[\s/]/g, '')})`}
                                dot={false}
                                activeDot={{ r: 3, fill: signalConfig[s].color, stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                                isAnimationActive={true}
                                animationDuration={800}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
