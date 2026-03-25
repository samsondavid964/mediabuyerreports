'use client'

import { useMemo, useState } from 'react'
import { signalConfig } from '@/lib/signalConfig'

const SortIcon = ({ active, direction }) => {
    return (
        <span className="ml-1 inline-flex text-[10px]" style={{ color: active ? 'var(--accent-blue)' : 'var(--text-muted)', opacity: active ? 1 : 0.5 }}>
            {active ? (direction === 'asc' ? '▲' : '▼') : '↕'}
        </span>
    )
}

export default function AtRiskTable({ logs }) {
    const [sortField, setSortField] = useState('atRiskDays')
    const [sortDirection, setSortDirection] = useState('desc')

    const data = useMemo(() => {
        const atRiskSignals = ['At Risk/Possible Churn', 'Underperforming', 'Mixed/Watching']
        const byClient = {}

        logs.forEach((log) => {
            if (!byClient[log.client_name]) byClient[log.client_name] = []
            byClient[log.client_name].push(log)
        })

        const derived = Object.entries(byClient)
            .map(([client, clientLogs]) => {
                const latest = [...clientLogs].sort((a, b) => b.date.localeCompare(a.date))[0]

                // Strictly exclude if latest status is Performing Well
                if (latest.performance_signal === 'Performing Well') return null

                const atRiskLogs = clientLogs.filter((l) => atRiskSignals.includes(l.performance_signal))
                if (!atRiskLogs.length) return null

                return {
                    client,
                    atRiskDays: atRiskLogs.length,
                    latestSignal: latest.performance_signal,
                    date: latest.date,
                    blockers: latest.blockers_problems || '—',
                    waitingOn: latest.waiting_on || '—',
                }
            })
            .filter(Boolean)

        return derived.sort((a, b) => {
            let aVal = a[sortField]
            let bVal = b[sortField]

            if (sortField === 'date' || sortField === 'client') {
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
            } else {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
            }
        })
    }, [logs, sortField, sortDirection])

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    if (data.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    Risk Radar
                </h3>
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="text-3xl">🎉</div>
                    <p style={{ color: 'var(--accent-green)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16 }}>No accounts at risk!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>All accounts are performing well or being monitored.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-6 animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                Risk Radar
                <span className="ml-2 text-sm px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,77,109,0.12)', color: 'var(--accent-coral)' }}>{data.length}</span>
            </h3>
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('client')} className="cursor-pointer hover:bg-black/10 transition-colors">
                                Client <SortIcon active={sortField === 'client'} direction={sortDirection} />
                            </th>
                            <th>Latest Signal</th>
                            <th onClick={() => handleSort('atRiskDays')} className="cursor-pointer hover:bg-black/10 transition-colors">
                                At-Risk Days <SortIcon active={sortField === 'atRiskDays'} direction={sortDirection} />
                            </th>
                            <th onClick={() => handleSort('date')} className="cursor-pointer hover:bg-black/10 transition-colors">
                                Entry Date <SortIcon active={sortField === 'date'} direction={sortDirection} />
                            </th>
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
                                        <span style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15 }}>{row.client}</span>
                                    </td>
                                    <td>
                                        <span className="signal-pill text-sm" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                                            {cfg.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: cfg.color, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14 }}>{row.atRiskDays}</span>
                                        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}> days</span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{row.date}</span>
                                    </td>
                                    <td>
                                        <span className="line-clamp-2" style={{ maxWidth: 220, display: 'block', fontSize: 14 }}>{row.blockers}</span>
                                    </td>
                                    <td>
                                        <span className="line-clamp-2" style={{ maxWidth: 220, display: 'block', fontSize: 14 }}>{row.waitingOn}</span>
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
