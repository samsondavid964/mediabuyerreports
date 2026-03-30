'use client'

import { useEffect, useState } from 'react'
import { signalConfig, isSubstantive } from '@/lib/signalConfig'

export default function LogSlideOver({ log, onClose }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (log) {
            setMounted(true)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [log])

    // Close on Escape key
    useEffect(() => {
        if (!log) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [log, onClose])

    if (!log) return null

    const cfg = signalConfig[log.performance_signal] || { color: 'var(--text-muted)', bg: 'var(--bg-surface)', label: log.performance_signal }

    const fields = [
        { label: '✅ Successes', value: log.successes },
        { label: '🚧 Blockers / Problems', value: log.blockers_problems },
        { label: '🔧 Account Changes', value: log.account_changes },
        { label: '📅 Planned for Tomorrow', value: log.planned_for_tomorrow },
        { label: '⏳ Waiting On', value: log.waiting_on },
        { label: '⚙️ Tech Setup Issues', value: log.tech_setup_issues },
    ]

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 animate-fade-in"
                style={{ background: 'var(--backdrop)', backdropFilter: 'blur(6px)' }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="fixed right-0 top-0 bottom-0 z-50 flex flex-col animate-slide-in overflow-hidden"
                style={{ width: 480, background: 'var(--bg-card)', borderLeft: '1px solid var(--border-subtle)' }}
            >
                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                            Log Entry
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close panel"
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200"
                            style={{ background: 'var(--row-hover)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-base rounded-xl px-3 py-1" style={{ background: 'var(--accent-teal-bg)', color: 'var(--accent-teal)', fontFamily: 'Syne, sans-serif' }}>
                            {log.client_name}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{log.date}</span>
                        <span className="signal-pill text-xs" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                            {cfg.label}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {fields.map(({ label, value }) => (
                        isSubstantive(value) ? (
                            <div key={label}>
                                <div className="text-xs uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--text-dim)', fontFamily: 'Syne, sans-serif' }}>
                                    {label}
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                                    {value}
                                </p>
                            </div>
                        ) : null
                    ))}
                    {fields.every(({ value }) => !isSubstantive(value)) && (
                        <p style={{ color: 'var(--text-dim)' }} className="text-sm">No detailed information for this log.</p>
                    )}
                </div>
            </div>
        </>
    )
}
