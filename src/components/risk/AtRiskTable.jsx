'use client'

import { useMemo } from 'react'
import { signalConfig } from '@/lib/signalConfig'

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

                const latest = [...clientLogs].sort((a, b) => b.date.localeCompare(a.date))[0]

                return {
                    client,
                    atRiskDays: atRiskLogs.length,
                    latestSignal: latest.performance_signal,
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
                <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    At-Risk Accounts
                </h3>
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="text-3xl">🎉</div>
                    <p style={{ color: 'var(--accent-green)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>No at-risk accounts!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All accounts are performing well or being monitored.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-6 animate-fade-in-up">
            <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                At-Risk Accounts
                <span className="ml-2 text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,77,109,0.12)', color: 'var(--accent-coral)' }}>{data.length}</span>
            </h3>
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Latest Signal</th>
                            <th>At-Risk Days</th>
                            <th>Latest Blockers</th>
                            <th>Waiting On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => {
                            const cfg = signalConfig[row.latestSignal] || { color: 'var(--text-muted)', bg: 'var(--bg-surface)', label: row.latestSignal }
                            return (
                                <tr
                                    key={row.client}
                                    style={{
                                        background: i % 2 === 0 ? 'transparent' : 'var(--row-stripe)',
                                        borderLeft: `3px solid ${cfg.color}`,
                                    }}
                                >
                                    <td>
                                        <span style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{row.client}</span>
                                    </td>
                                    <td>
                                        <span className="signal-pill text-xs" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                                            {cfg.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: cfg.color, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{row.atRiskDays}</span>
                                        <span style={{ color: 'var(--text-dim)', fontSize: 11 }}> days</span>
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
