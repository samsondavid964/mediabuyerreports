'use client'

import { useState, useRef, useEffect } from 'react'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseDate(s) {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export default function DateRangePicker({ startDate, endDate, onChange }) {
    const [open, setOpen] = useState(false)
    const [viewDate, setViewDate] = useState(() => parseDate(startDate))
    const [selecting, setSelecting] = useState(null) // null | 'start-picked'
    const [tempStart, setTempStart] = useState(null)
    const ref = useRef(null)

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = new Date(year, month, 1).getDay()

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

    const handleDayClick = (day) => {
        const clicked = new Date(year, month, day)
        const clickedStr = formatDate(clicked)
        if (!selecting) {
            setTempStart(clickedStr)
            setSelecting('start-picked')
        } else {
            let s = tempStart, e = clickedStr
            if (s > e) [s, e] = [e, s]
            onChange({ start: s, end: e })
            setSelecting(null)
            setTempStart(null)
            setOpen(false)
        }
    }

    const isInRange = (day) => {
        const d = formatDate(new Date(year, month, day))
        return d >= startDate && d <= endDate
    }
    const isStart = (day) => formatDate(new Date(year, month, day)) === startDate
    const isEnd = (day) => formatDate(new Date(year, month, day)) === endDate
    const isTempStart = (day) => tempStart && formatDate(new Date(year, month, day)) === tempStart

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' })

    const displayStart = parseDate(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const displayEnd = parseDate(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { setOpen(!open); setSelecting(null); setTempStart(null) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-300"
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                }}
            >
                <span style={{ fontSize: 14 }}>📅</span>
                <span>{displayStart}</span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <span>{displayEnd}</span>
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 z-50 animate-fade-in"
                    style={{
                        width: 300,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 16,
                        padding: 16,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                    }}
                >
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px 8px' }}>‹</button>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                            {monthName} {year}
                        </span>
                        <button onClick={nextMonth} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px 8px' }}>›</button>
                    </div>

                    {selecting && (
                        <div className="text-center mb-3" style={{ fontSize: 11, color: 'var(--accent-teal)' }}>
                            Click to select end date
                        </div>
                    )}

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                        {DAYS.map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', padding: 4, fontFamily: 'Inter, sans-serif' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const inRange = isInRange(day)
                            const start = isStart(day)
                            const end = isEnd(day)
                            const temp = isTempStart(day)
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        border: 'none',
                                        borderRadius: start || end || temp ? 8 : 4,
                                        fontSize: 12,
                                        fontFamily: 'Inter, sans-serif',
                                        cursor: 'pointer',
                                        background: start || end || temp
                                            ? 'var(--accent-teal)'
                                            : inRange
                                                ? 'var(--accent-teal-bg)'
                                                : 'transparent',
                                        color: start || end || temp
                                            ? '#050505'
                                            : inRange
                                                ? 'var(--accent-teal)'
                                                : 'var(--text-secondary)',
                                        fontWeight: start || end || temp ? 700 : 400,
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={e => {
                                        if (!start && !end && !temp) e.target.style.background = 'var(--row-hover)'
                                    }}
                                    onMouseLeave={e => {
                                        if (!start && !end && !temp) {
                                            e.target.style.background = inRange ? 'var(--accent-teal-bg)' : 'transparent'
                                        }
                                    }}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>

                    {/* Quick presets */}
                    <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        {[
                            { label: '7d', days: 7 },
                            { label: '14d', days: 14 },
                            { label: '30d', days: 30 },
                            { label: '90d', days: 90 },
                        ].map(p => (
                            <button
                                key={p.label}
                                onClick={() => {
                                    const end = new Date()
                                    const start = new Date()
                                    start.setDate(start.getDate() - p.days)
                                    onChange({ start: formatDate(start), end: formatDate(end) })
                                    setOpen(false)
                                }}
                                className="flex-1 py-1.5 rounded-lg text-xs transition-all duration-200"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
