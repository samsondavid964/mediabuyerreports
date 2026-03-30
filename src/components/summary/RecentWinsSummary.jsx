'use client'

import { useMemo } from 'react'
import { signalConfig, isSubstantive } from '@/lib/signalConfig'
import { RECENT_WINS_LIMIT } from '@/lib/constants'

export default function RecentWinsSummary({ logs }) {
    const wins = useMemo(() => {
        return [...logs]
            .filter((l) => l.performance_signal === 'Performing Well' && isSubstantive(l.successes))
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, RECENT_WINS_LIMIT)
    }, [logs])

    return (
        <div className="elevated-card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 20 }}>🏆</span>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    Recent Wins
                </h3>
                {wins.length > 0 && (
                    <span className="text-sm px-2.5 py-1 rounded-md" style={{ background: 'rgba(74,222,128,0.12)', color: 'var(--accent-green)' }}>
                        {wins.length}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {wins.length === 0 ? (
                    <div className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>No recent wins recorded</div>
                ) : (
                    wins.map((log, i) => (
                        <div
                            key={`${log.client_name}-${log.date}-${i}`}
                            className="p-3 rounded-xl shrink-0"
                            style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)' }}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="font-semibold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
                                    {log.client_name}
                                </span>
                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{log.date}</span>
                            </div>
                            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                ✅ {log.successes}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
