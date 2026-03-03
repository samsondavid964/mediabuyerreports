'use client'

import { useMemo } from 'react'
import { isSubstantive } from '@/lib/signalConfig'

export default function TechIssues({ logs }) {
    const issues = useMemo(() => {
        return logs
            .filter((l) => isSubstantive(l.tech_setup_issues))
            .sort((a, b) => b.date.localeCompare(a.date))
    }, [logs])

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                Tech Setup Issues
                {issues.length > 0 && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(245,200,66,0.12)', color: '#f5c842' }}>{issues.length}</span>
                )}
            </h3>
            {issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <div className="text-2xl">✅</div>
                    <p style={{ color: '#4ade80', fontSize: 13 }}>No tech issues reported</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {issues.map((log) => (
                        <div
                            key={log.id}
                            className="p-3 rounded-xl transition-all duration-200"
                            style={{ background: 'rgba(245,200,66,0.04)', border: '1px solid rgba(245,200,66,0.08)' }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold" style={{ color: '#f5c842', fontFamily: 'Syne, sans-serif' }}>
                                    {log.client_name}
                                </span>
                                <span className="text-xs" style={{ color: '#64748b' }}>{log.date}</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{log.tech_setup_issues}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
