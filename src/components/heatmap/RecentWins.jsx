'use client'

import { useMemo } from 'react'
import { signalConfig, isSubstantive } from '@/lib/signalConfig'

const GOOD_SIGNALS = ['Performing Well', 'Mixed/Watching']

export default function RecentWins({ logs }) {
    const wins = useMemo(() => {
        return [...logs]
            .filter((l) => GOOD_SIGNALS.includes(l.performance_signal))
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 8)
    }, [logs])

    if (wins.length === 0) return null

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-3 mb-5">
                <span style={{ fontSize: 18 }}>🏆</span>
                <h3 className="text-base font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                    Recent Wins
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
                    {wins.length} entries
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {wins.map((log, i) => {
                    const cfg = signalConfig[log.performance_signal] || {}
                    const preview = isSubstantive(log.successes)
                        ? log.successes
                        : isSubstantive(log.account_changes)
                            ? log.account_changes
                            : null

                    return (
                        <div
                            key={`${log.client_name}-${log.date}-${i}`}
                            className="p-4 rounded-xl flex flex-col gap-2 transition-all duration-300"
                            style={{
                                background: `${cfg.color}08`,
                                border: `1px solid ${cfg.color}20`,
                            }}
                        >
                            {/* Top row: client + signal */}
                            <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-sm leading-tight" style={{ color: '#f1f5f9', fontFamily: 'Syne, sans-serif' }}>
                                    {log.client_name}
                                </span>
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                                    style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                                >
                                    {cfg.label}
                                </span>
                            </div>

                            {/* Date */}
                            <span className="text-xs" style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                                {log.date}
                            </span>

                            {/* Preview text */}
                            {preview && (
                                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#94a3b8' }}>
                                    {preview}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
