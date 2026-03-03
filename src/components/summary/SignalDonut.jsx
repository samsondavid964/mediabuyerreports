'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { signalConfig, signalOrder } from '@/lib/signalConfig'

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
        <div className="custom-tooltip" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 16px' }}>
            <div className="label" style={{ color: '#f1f5f9', fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 6 }}>
                {d.name}
            </div>
            <div style={{ color: d.payload.color, fontSize: 13 }}>
                {d.value} logs ({d.payload.pct}%)
            </div>
        </div>
    )
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontFamily="Inter, sans-serif">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

export default function SignalDonut({ logs }) {
    const data = useMemo(() => {
        const counts = {}
        signalOrder.forEach((s) => (counts[s] = 0))
        logs.forEach((l) => {
            if (counts[l.performance_signal] !== undefined) counts[l.performance_signal]++
        })
        const total = logs.length || 1
        return signalOrder
            .filter((s) => counts[s] > 0)
            .map((s) => ({
                name: signalConfig[s].label,
                value: counts[s],
                color: signalConfig[s].color,
                pct: Math.round((counts[s] / total) * 100),
            }))
    }, [logs])

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-base font-semibold mb-6" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                Signal Distribution
            </h3>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-64" style={{ color: '#64748b' }}>No data</div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            labelLine={false}
                            label={renderCustomLabel}
                            isAnimationActive={true}
                            animationBegin={200}
                            animationDuration={800}
                            animationEasing="ease-out"
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value, entry) => (
                                <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                                    {value}
                                </span>
                            )}
                            iconType="circle"
                            iconSize={8}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
