'use client'

import { useMemo } from 'react'
import { signalConfig, isSubstantive } from '@/lib/signalConfig'

export default function ClientStats({ logs }) {
    const stats = useMemo(() => {
        if (!logs.length) return null

        const totalDays = logs.length
        const wellDays = logs.filter((l) => l.performance_signal === 'Performing Well').length
        const pctWell = Math.round((wellDays / totalDays) * 100)

        const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))
        const lastLog = sorted[0]
        const lastSignal = lastLog?.performance_signal

        // Most common blocker keyword
        const blockerWords = {}
        logs.forEach((l) => {
            if (!isSubstantive(l.blockers_problems)) return
            l.blockers_problems.toLowerCase().split(/\s+/).forEach((w) => {
                if (w.length > 4) blockerWords[w] = (blockerWords[w] || 0) + 1
            })
        })
        const topBlocker = Object.entries(blockerWords).sort(([, a], [, b]) => b - a)[0]

        return { totalDays, pctWell, lastSignal, topBlocker: topBlocker?.[0] }
    }, [logs])

    if (!stats) return null

    const lastCfg = signalConfig[stats.lastSignal] || { color: '#64748b', bg: '#111111', label: stats.lastSignal }
    const wellColor = stats.pctWell >= 70 ? '#4ade80' : stats.pctWell >= 40 ? '#f5c842' : '#ff4d6d'

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-base font-semibold mb-5" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                Client Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#475569', fontFamily: 'Syne, sans-serif' }}>Total Log Days</div>
                    <div className="text-3xl font-bold" style={{ color: '#00e5cc', fontFamily: 'Syne, sans-serif' }}>{stats.totalDays}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#475569', fontFamily: 'Syne, sans-serif' }}>Days Performing Well</div>
                    <div className="text-3xl font-bold" style={{ color: wellColor, fontFamily: 'Syne, sans-serif' }}>{stats.pctWell}%</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#475569', fontFamily: 'Syne, sans-serif' }}>Last Signal</div>
                    <span className="signal-pill text-xs" style={{ background: lastCfg.bg, color: lastCfg.color, border: `1px solid ${lastCfg.color}30`, marginTop: 6, display: 'inline-flex' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: lastCfg.color, display: 'inline-block' }} />
                        {lastCfg.label}
                    </span>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#475569', fontFamily: 'Syne, sans-serif' }}>Top Blocker</div>
                    <div className="text-sm font-semibold capitalize" style={{ color: '#ff4d6d', fontFamily: 'Inter, sans-serif' }}>
                        {stats.topBlocker || '—'}
                    </div>
                </div>
            </div>
        </div>
    )
}
