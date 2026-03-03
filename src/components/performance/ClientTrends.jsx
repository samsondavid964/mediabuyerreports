'use client'

import { useMemo, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'
import { getHealthScore, signalConfig } from '@/lib/signalConfig'

const COLORS = [
    '#00e5cc', '#f5c842', '#4ade80', '#ff4d6d', '#00b4d8',
    '#a78bfa', '#fb923c', '#38bdf8', '#f472b6', '#86efac',
]

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px', maxWidth: 240 }}>
            <div style={{ color: '#f1f5f9', fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{label}</div>
            {payload.map((p) => (
                <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>
                    <span style={{ width: 8, height: 2, background: p.stroke, display: 'inline-block', borderRadius: 1 }} />
                    {p.name}: <span style={{ color: p.stroke, fontWeight: 600 }}>{p.value}%</span>
                </div>
            ))}
        </div>
    )
}

export default function ClientTrends({ logs }) {
    const allClients = useMemo(() => {
        const counts = {}
        logs.forEach((l) => { counts[l.client_name] = (counts[l.client_name] || 0) + 1 })
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([c]) => c)
    }, [logs])

    const top5 = useMemo(() => allClients.slice(0, 5), [allClients])
    const [visible, setVisible] = useState(top5)

    const data = useMemo(() => {
        const byDate = {}
        logs.forEach((log) => {
            if (!byDate[log.date]) byDate[log.date] = {}
            if (!byDate[log.date][log.client_name]) byDate[log.date][log.client_name] = []
            byDate[log.date][log.client_name].push(log)
        })
        return Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, clients]) => {
                const row = { date }
                Object.entries(clients).forEach(([client, clientLogs]) => {
                    row[client] = getHealthScore(clientLogs)
                })
                return row
            })
    }, [logs])

    const shownClients = visible.length > 0 ? visible : top5

    const toggleClient = (c) => {
        setVisible((prev) =>
            prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
        )
    }

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="text-base font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                    Client Health Trends
                </h3>
                <div className="flex flex-wrap gap-2">
                    {allClients.slice(0, 10).map((c, i) => (
                        <button
                            key={c}
                            onClick={() => toggleClient(c)}
                            className="text-xs px-3 py-1 rounded-full border transition-all duration-300"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                borderColor: shownClients.includes(c) ? COLORS[i % COLORS.length] : 'rgba(255,255,255,0.08)',
                                background: shownClients.includes(c) ? `${COLORS[i % COLORS.length]}12` : 'transparent',
                                color: shownClients.includes(c) ? COLORS[i % COLORS.length] : '#64748b',
                            }}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-64" style={{ color: '#64748b' }}>No data</div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                        {allClients.slice(0, 10).map((c, i) => (
                            <Line
                                key={c}
                                type="monotone"
                                dataKey={c}
                                stroke={COLORS[i % COLORS.length]}
                                strokeWidth={shownClients.includes(c) ? 2 : 0}
                                dot={false}
                                activeDot={shownClients.includes(c) ? { r: 4, stroke: '#050505', strokeWidth: 2 } : false}
                                connectNulls
                                isAnimationActive={true}
                                animationDuration={800}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
