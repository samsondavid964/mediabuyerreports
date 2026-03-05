'use client'

import { useMemo, useState } from 'react'
import { signalConfig, isSubstantive, signalOrder } from '@/lib/signalConfig'
import { SkeletonChart } from '@/components/SkeletonLoader'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

function ClientCard({ client, clientLogs }) {
    const [expanded, setExpanded] = useState(false)

    const stats = useMemo(() => {
        const totalDays = clientLogs.length
        const sorted = [...clientLogs].sort((a, b) => b.date.localeCompare(a.date))
        const latest = sorted[0]
        const latestSignal = latest?.performance_signal

        const first = sorted[sorted.length - 1]
        const firstDate = first ? new Date(first.date.includes('T') ? first.date : `${first.date}T00:00:00`) : new Date()
        const diffTime = Math.abs(new Date() - firstDate)
        const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        const counts = {}
        const topSignal = { name: '', count: 0, label: '' }
        signalOrder.forEach((s) => (counts[s] = 0))
        clientLogs.forEach((l) => {
            if (counts[l.performance_signal] !== undefined) {
                counts[l.performance_signal]++
            }
        })
        const distribution = signalOrder
            .filter((s) => counts[s] > 0)
            .map((s) => {
                const label = signalConfig[s]?.label || s
                if (counts[s] > topSignal.count) {
                    topSignal.name = s
                    topSignal.count = counts[s]
                    topSignal.label = label
                }
                return {
                    name: label,
                    value: counts[s],
                    color: signalConfig[s]?.color || '#ccc',
                }
            })

        const distributionText = signalOrder
            .filter((s) => counts[s] > 0)
            .map(s => `${s}: ${counts[s]}`)
            .join(' ')

        return { totalDays, latestSignal, distribution, topSignal, distributionText, sorted, daysAgo }
    }, [clientLogs])

    const cfg = signalConfig[stats.latestSignal] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: stats.latestSignal }

    return (
        <div className="mb-4 rounded-lg overflow-hidden transition-all duration-300" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 text-left transition-colors duration-200"
                style={{ background: 'transparent', cursor: 'pointer' }}
            >
                <div className="flex items-center gap-3">
                    <span
                        style={{ color: 'var(--text-muted)', fontSize: 16, transition: 'transform 0.3s ease', transform: expanded ? 'rotate(0)' : 'rotate(-90deg)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </span>
                    <h4 className="text-base font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                        {client}
                    </h4>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    {cfg.label && (
                        <span className="px-3 py-1.5 rounded-full font-medium text-xs whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                            {cfg.label}
                        </span>
                    )}
                    <div className="flex items-center gap-1.5 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{stats.daysAgo}d ago</span>
                    </div>
                    <span className="whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{stats.totalDays} entries</span>
                </div>
            </button>

            {/* Expanded content */}
            {expanded && (
                <div className="p-6 flex flex-col md:flex-row gap-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    {/* Left: Status Distribution */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <h5 className="text-sm font-semibold mb-6 w-full text-center" style={{ color: 'var(--text-secondary)' }}>Status Distribution</h5>

                        <div className="relative h-48 w-full flex items-center justify-center">
                            {stats.distribution.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.distribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                                isAnimationActive={true}
                                                animationBegin={0}
                                                animationDuration={800}
                                                animationEasing="ease-out"
                                            >
                                                {stats.distribution.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Overlay Badge */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="px-4 py-3 shadow-md text-sm font-semibold whitespace-nowrap" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                            {stats.topSignal.name} : {stats.topSignal.count}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full w-full" style={{ color: 'var(--text-muted)' }}>
                                    No Data
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-xs text-center px-4 leading-relaxed font-medium" style={{ color: 'var(--text-muted)' }}>
                            {stats.distributionText}
                        </div>
                    </div>

                    {/* Right: Timeline */}
                    <div className="w-full md:w-2/3">
                        <h5 className="text-sm font-semibold mb-6" style={{ color: 'var(--text-secondary)' }}>Timeline ({stats.totalDays} entries)</h5>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {stats.sorted.map((log, i) => {
                                const logCfg = signalConfig[log.performance_signal] || { bg: 'rgba(100,116,139,0.1)', color: '#64748b', label: log.performance_signal }

                                const hasActivity = isSubstantive(log.successes) || isSubstantive(log.blockers_problems) || isSubstantive(log.account_changes)

                                return (
                                    <div key={log.id || i} className="rounded-xl p-4 transition-colors" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{log.date}</span>
                                            {log.performance_signal && (
                                                <span className="px-3 py-1 rounded-full font-medium text-xs" style={{ background: logCfg.bg, color: logCfg.color, border: `1px solid ${logCfg.color}30` }}>
                                                    {logCfg.label}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {isSubstantive(log.successes) && (
                                                <div className="flex items-start gap-2">
                                                    <span style={{ color: 'var(--accent-green)', marginTop: '2px' }}>✓</span>
                                                    <span>{log.successes}</span>
                                                </div>
                                            )}
                                            {isSubstantive(log.blockers_problems) && (
                                                <div className="flex items-start gap-2">
                                                    <span style={{ color: 'var(--accent-coral)', marginTop: '2px' }}>✕</span>
                                                    <span>{log.blockers_problems}</span>
                                                </div>
                                            )}
                                            {isSubstantive(log.account_changes) && (
                                                <div className="flex items-start gap-2">
                                                    <span style={{ color: 'var(--accent-yellow)', marginTop: '2px' }}>→</span>
                                                    <span>{log.account_changes}</span>
                                                </div>
                                            )}

                                            {!hasActivity && (
                                                <span className="italic" style={{ color: 'var(--text-dim)' }}>No notable activity documented for this entry.</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ClientDeepDiveTab({ logs, loading }) {
    const clientGroups = useMemo(() => {
        const byClient = {}
        logs.forEach((l) => {
            if (!byClient[l.client_name]) byClient[l.client_name] = []
            byClient[l.client_name].push(l)
        })
        return Object.entries(byClient)
            .map(([client, clientLogs]) => ({ client, clientLogs }))
            .sort((a, b) => a.client.localeCompare(b.client))
    }, [logs])

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <SkeletonChart key={i} height="80px" />)}
            </div>
        )
    }

    if (clientGroups.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <p style={{ color: 'var(--text-muted)' }}>No data available for the selected date range.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    Client Deep Dive
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--accent-teal-bg)', color: 'var(--accent-teal)' }}>
                        {clientGroups.length} clients
                    </span>
                </h2>
            </div>
            {clientGroups.map(({ client, clientLogs }) => (
                <ClientCard key={client} client={client} clientLogs={clientLogs} />
            ))}
        </div>
    )
}
