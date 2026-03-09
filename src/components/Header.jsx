'use client'

import { useState, useEffect } from 'react'
import DateRangePicker from './DateRangePicker'

export default function Header({ startDate, endDate, onStartDateChange, onEndDateChange, onLogout }) {
    const [theme, setTheme] = useState('dark')

    useEffect(() => {
        const saved = localStorage.getItem('adlab-theme') || 'dark'
        setTheme(saved)
        document.documentElement.setAttribute('data-theme', saved)
    }, [])

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        document.documentElement.setAttribute('data-theme', next)
        localStorage.setItem('adlab-theme', next)
    }

    const handleDateChange = ({ start, end }) => {
        onStartDateChange(start)
        onEndDateChange(end)
    }

    return (
        <header className="sticky top-0 z-50 glass-card border-b px-6 py-4 flex items-center justify-between"
            style={{ borderRadius: 0, borderColor: 'var(--border-subtle)', background: 'var(--glass-bg)', backdropFilter: 'blur(24px)' }}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ background: '#000' }}>
                    <img src="/logo.png" alt="Ad-Lab" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                        Ad-Lab
                    </h1>
                    <p className="text-xs tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                        PERFORMANCE INTELLIGENCE DASHBOARD
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateChange}
                />
                <button
                    onClick={toggleTheme}
                    className="theme-toggle"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        title="Log out"
                        style={{
                            height: 38,
                            padding: '0 16px',
                            borderRadius: 12,
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 13,
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-coral)'
                            e.currentTarget.style.color = 'var(--accent-coral)'
                            e.currentTarget.style.background = 'rgba(255,77,109,0.06)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)'
                            e.currentTarget.style.color = 'var(--text-muted)'
                            e.currentTarget.style.background = 'var(--bg-surface)'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Log Out
                    </button>
                )}

            </div>
        </header>
    )
}
