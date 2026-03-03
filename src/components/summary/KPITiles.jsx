'use client'

import { useMemo, useEffect, useState } from 'react'
import { getHealthScore, isSubstantive, signalConfig } from '@/lib/signalConfig'

function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (target === null || target === undefined) return
        let start = null
        const startVal = 0
        const step = (timestamp) => {
            if (!start) start = timestamp
            const progress = Math.min((timestamp - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(startVal + eased * (target - startVal)))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        return () => { start = -Infinity }
    }, [target, duration])
    return count
}

function KPICard({ title, value, suffix = '', icon, accentColor, subtext, delay = 0 }) {
    const animated = useCountUp(typeof value === 'number' ? value : null)

    return (
        <div
            className="glass-card p-6 flex flex-col gap-3 animate-fade-in-up relative overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: accentColor }} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-medium" style={{ color: '#64748b', fontFamily: 'Syne, sans-serif' }}>
                    {title}
                </span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                    style={{ background: `${accentColor}12`, color: accentColor }}>
                    {icon}
                </div>
            </div>

            {/* Value */}
            <div className="flex items-end gap-1.5">
                <span className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9', lineHeight: 1 }}>
                    {typeof value === 'number' ? animated : value}
                </span>
                {suffix && (
                    <span className="text-xl font-semibold mb-0.5" style={{ color: accentColor }}>
                        {suffix}
                    </span>
                )}
            </div>

            {/* Subtext */}
            {subtext && (
                <span className="text-xs" style={{ color: '#64748b' }}>{subtext}</span>
            )}
        </div>
    )
}

export default function KPITiles({ logs }) {
    const stats = useMemo(() => {
        const totalLogs = logs.length
        const uniqueClients = new Set(logs.map((l) => l.client_name)).size
        const healthScore = getHealthScore(logs)
        const activeBlockers = logs.filter((l) => isSubstantive(l.blockers_problems)).length

        const scoreColor =
            healthScore === null ? '#64748b'
                : healthScore >= 75 ? '#4ade80'
                    : healthScore >= 50 ? '#f5c842'
                        : '#ff4d6d'

        return { totalLogs, uniqueClients, healthScore, activeBlockers, scoreColor }
    }, [logs])

    const tiles = [
        {
            title: 'Total Logs',
            value: stats.totalLogs,
            icon: '📋',
            accentColor: '#00e5cc',
            subtext: 'Log entries in range',
        },
        {
            title: 'Accounts Tracked',
            value: stats.uniqueClients,
            icon: '🏢',
            accentColor: '#00b4d8',
            subtext: 'Unique client accounts',
        },
        {
            title: 'Portfolio Health',
            value: stats.healthScore ?? 0,
            suffix: '%',
            icon: '⚡',
            accentColor: stats.scoreColor,
            subtext: stats.healthScore !== null
                ? stats.healthScore >= 75 ? '▲ Portfolio performing well'
                    : stats.healthScore >= 50 ? '◉ Portfolio watching'
                        : '▼ Portfolio needs attention'
                : 'No data',
        },
        {
            title: 'Active Blockers',
            value: stats.activeBlockers,
            icon: '🚧',
            accentColor: stats.activeBlockers > 0 ? '#ff4d6d' : '#4ade80',
            subtext: stats.activeBlockers > 0
                ? 'Accounts reporting blockers'
                : 'No blockers reported',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {tiles.map((tile, i) => (
                <KPICard key={tile.title} {...tile} delay={i * 80} />
            ))}
        </div>
    )
}
