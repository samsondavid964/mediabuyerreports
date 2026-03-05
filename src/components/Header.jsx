'use client'

import { useState, useEffect } from 'react'
import DateRangePicker from './DateRangePicker'

export default function Header({ startDate, endDate, onStartDateChange, onEndDateChange }) {
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
            </div>
        </header>
    )
}
