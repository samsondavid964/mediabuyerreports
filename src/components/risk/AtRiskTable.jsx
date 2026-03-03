'use client'

import { useMemo } from 'react'
import { signalConfig } from '@/lib/signalConfig'

function TrendArrow({ trend }) {
    if (trend === 'improving')
        return <span style={{ color: '#4ade80', fontSize: 16 }}>↑</span>
    if (trend === 'deteriorating')
        return <span style={{ color: '#ff4d6d', fontSize: 16 }}>↓</span>
    return <span style={{ color: '#64748b', fontSize: 16 }}>→</span>
}

export default function AtRiskTable({ logs }) {
    const data = useMemo(() => {
        const atRiskSignals = ['At Risk/Possible Churn', 'Underperforming']
        const byClient = {}

        logs.forEach((log) => {
            if (!byClient[log.client_name]) byClient[log.client_name] = []
            byClient[log.client_name].push(log)
        })

        return Object.entries(byClient)
            .map(([client, clientLogs]) => {
                const atRiskLogs = clientLogs.filter((l) => atRiskSignals.includes(l.performance_signal))
                if (!atRiskLogs.length) return null

                const sorted = [...clientLogs].sort((a, b) => a.date.localeCompare(b.date))
                const mid = Math.floor(sorted.length / 2)
                const firstHalf = sorted.slice(0, mid)
                const secondHalf = sorted.slice(mid)

                const atRiskFirst = firstHalf.filter((l) => atRiskSignals.includes(l.performance_signal)).length / (firstHalf.length || 1)
                const atRiskSecond = secondHalf.filter((l) => atRiskSignals.includes(l.performance_signal)).length / (secondHalf.length || 1)
                const trend = atRiskSecond < atRiskFirst ? 'improving' : atRiskSecond > atRiskFirst ? 'deteriorating' : 'stable'

                const latest = [...clientLogs].sort((a, b) => b.date.localeCompare(a.date))[0]

                return {
                    client,
                    atRiskDays: atRiskLogs.length,
                    latestSignal: latest.performance_signal,
                    trend,
                    blockers: latest.blockers_problems || '—',
                    waitingOn: latest.waiting_on || '—',
                }
            })
            .filter(Boolean)
            .sort((a, b) => b.atRiskDays - a.atRiskDays)
    }, [logs])

    if (data.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                    At-Risk Accounts
                </h3>
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="text-3xl">🎉</div>
                    <p style={{ color: '#4ade80', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>No at-risk accounts!</p>
                    <p style={{ color: '#64748b', fontSize: 13 }}>All accounts are performing well or being monitored.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-6 animate-fade-in-up">
            <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                At-Risk Accounts
                <span className="ml-2 text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,77,109,0.12)', color: '#ff4d6d' }}>{data.length}</span>
            </h3>
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Latest Signal</th>
                            <th>At-Risk Days</th>
                            <th>Trend</th>
                            <th>Latest Blockers</th>
                            <th>Waiting On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => {
                            const cfg = signalConfig[row.latestSignal] || { color: '#64748b', bg: '#111111', label: row.latestSignal }
                            return (
                                <tr
                                    key={row.client}
                                    style={{
                                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                                        borderLeft: `3px solid ${cfg.color}`,
                                    }}
                                >
                                    <td>
                                        <span style={{ color: '#f1f5f9', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{row.client}</span>
                                    </td>
                                    <td>
                                        <span className="signal-pill text-xs" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                                            {cfg.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: cfg.color, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{row.atRiskDays}</span>
                                        <span style={{ color: '#475569', fontSize: 11 }}> days</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5">
                                            <TrendArrow trend={row.trend} />
                                            <span style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{row.trend}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="line-clamp-2" style={{ maxWidth: 200, display: 'block', fontSize: 12 }}>{row.blockers}</span>
                                    </td>
                                    <td>
                                        <span className="line-clamp-2" style={{ maxWidth: 200, display: 'block', fontSize: 12 }}>{row.waitingOn}</span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
