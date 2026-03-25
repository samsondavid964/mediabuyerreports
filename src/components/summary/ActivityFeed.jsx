'use client'

import { useMemo } from 'react'
import { signalConfig, isSubstantive } from '@/lib/signalConfig'

function SignalPill({ signal }) {
    const cfg = signalConfig[signal] || { color: '#64748b', bg: '#111111', label: signal }
    return (
        <span className="signal-pill text-sm" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: cfg.color }} />
            {cfg.label}
        </span>
    )
}

export default function ActivityFeed({ logs }) {
    const recent = useMemo(() => {
        return [...logs]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
    }, [logs])

    const getPreview = (log) => {
        if (isSubstantive(log.blockers_problems)) return `🚧 ${log.blockers_problems}`
        if (isSubstantive(log.successes)) return `✅ ${log.successes}`
        if (isSubstantive(log.account_changes)) return `🔧 ${log.account_changes}`
        return '—'
    }

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                Recent Activity
            </h3>
            <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
                {recent.length === 0 ? (
                    <div style={{ color: '#64748b' }} className="text-base py-8 text-center">No recent activity</div>
                ) : (
                    recent.map((log, i) => (
                        <div
                            key={log.id}
                            className="flex flex-col gap-1.5 p-3 rounded-xl transition-all duration-300"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', animationDelay: `${i * 40}ms` }}
                        >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-semibold text-base rounded-lg px-2.5 py-1" style={{ background: 'rgba(0,229,204,0.08)', color: '#00e5cc', fontFamily: 'Syne, sans-serif' }}>
                                    {log.client_name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <SignalPill signal={log.performance_signal} />
                                    <span className="text-sm" style={{ color: '#64748b' }}>{log.date}</span>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#94a3b8' }}>
                                {getPreview(log)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
