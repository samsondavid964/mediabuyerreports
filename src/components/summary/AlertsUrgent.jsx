'use client'

import { useMemo } from 'react'
import { signalConfig, isSubstantive } from '@/lib/signalConfig'

export default function AlertsUrgent({ logs }) {
    const alerts = useMemo(() => {
        const atRiskSignals = ['At Risk/Possible Churn', 'Underperforming']
        const items = []

        // Group by client, get latest log per client
        const byClient = {}
        logs.forEach((l) => {
            if (!byClient[l.client_name]) byClient[l.client_name] = []
            byClient[l.client_name].push(l)
        })

        Object.entries(byClient).forEach(([client, clientLogs]) => {
            const sorted = [...clientLogs].sort((a, b) => b.date.localeCompare(a.date))
            const latest = sorted[0]
            if (atRiskSignals.includes(latest.performance_signal)) {
                items.push({
                    type: 'signal',
                    severity: latest.performance_signal === 'At Risk/Possible Churn' ? 'critical' : 'warning',
                    client,
                    date: latest.date,
                    signal: latest.performance_signal,
                    detail: latest.blockers_problems || latest.waiting_on || null,
                })
            }
        })

        return items.sort((a, b) => {
            if (a.severity === 'critical' && b.severity !== 'critical') return -1
            if (b.severity === 'critical' && a.severity !== 'critical') return 1
            return b.date.localeCompare(a.date)
        })
    }, [logs])

    return (
        <div className="elevated-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 20 }}>🚨</span>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    Alerts & Urgent Items
                </h3>
                {alerts.length > 0 && (
                    <span className="text-sm px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,77,109,0.12)', color: 'var(--accent-coral)' }}>
                        {alerts.length}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <div className="text-2xl">✅</div>
                        <p style={{ color: 'var(--accent-green)', fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>All clear!</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No urgent alerts right now</p>
                    </div>
                ) : (
                    alerts.map((alert, i) => {
                        const cfg = signalConfig[alert.signal] || { color: 'var(--text-muted)', bg: 'var(--bg-surface)', label: alert.signal }
                        const borderColor = alert.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-yellow)'
                        return (
                            <div
                                key={`${alert.client}-${alert.date}-${i}`}
                                className="flex flex-col gap-1.5 p-3 rounded-xl relative overflow-hidden shrink-0"
                                style={{ background: 'var(--row-stripe)', border: `1px solid var(--border-subtle)` }}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: borderColor }} />
                                <div className="flex items-center justify-between gap-2 flex-wrap pl-2">
                                    <span className="font-semibold text-base" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                                        {alert.client}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="signal-pill text-sm" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.color }} />
                                            {cfg.label}
                                        </span>
                                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{alert.date}</span>
                                    </div>
                                </div>
                                {isSubstantive(alert.detail) && (
                                    <p className="text-sm leading-relaxed line-clamp-2 pl-2" style={{ color: 'var(--text-secondary)' }}>
                                        {alert.type === 'blocker' ? '🚧 ' : ''}{alert.detail}
                                    </p>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
