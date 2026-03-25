'use client'

import { useMemo } from 'react'
import { signalConfig } from '@/lib/signalConfig'

export default function StagnantAccounts({ logs }) {
    const stagnant = useMemo(() => {
        const byClient = {}
        logs.forEach((l) => {
            if (!byClient[l.client_name]) byClient[l.client_name] = []
            byClient[l.client_name].push(l)
        })

        const results = []
        Object.entries(byClient).forEach(([client, clientLogs]) => {
            const mixedLogs = clientLogs.filter((l) => l.performance_signal === 'Mixed/Watching')
            if (mixedLogs.length >= 5) {
                const sortedMixed = [...mixedLogs].sort((a, b) => a.date.localeCompare(b.date))
                results.push({
                    client,
                    days: mixedLogs.length,
                    signal: 'Mixed/Watching',
                    since: sortedMixed[0].date
                })
            }
        })

        return results.sort((a, b) => b.days - a.days)
    }, [logs])

    return (
        <div className="elevated-card p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 20 }}>⏸️</span>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    Stagnant Accounts
                </h3>
                {stagnant.length > 0 && (
                    <span className="text-sm px-2.5 py-1 rounded-md" style={{ background: 'rgba(245,200,66,0.12)', color: 'var(--accent-yellow)' }}>
                        {stagnant.length}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {stagnant.length === 0 ? (
                    <div className="text-base py-6 text-center" style={{ color: 'var(--text-muted)' }}>No stagnant accounts detected</div>
                ) : (
                    stagnant.map((item, i) => {
                        const cfg = signalConfig[item.signal] || { color: 'var(--text-muted)', bg: 'var(--bg-surface)', label: item.signal }
                        return (
                            <div
                                key={item.client}
                                className="p-3 rounded-xl flex items-center justify-between gap-3 shrink-0"
                                style={{ background: 'var(--row-stripe)', border: '1px solid var(--border-subtle)' }}
                            >
                                <div className="flex flex-col gap-1 min-w-0">
                                    <span className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
                                        {item.client}
                                    </span>
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {item.days} Mixed/Watching entries • since {item.since}
                                    </span>
                                </div>
                                <span className="signal-pill text-sm flex-shrink-0" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.color }} />
                                    {cfg.label}
                                </span>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
