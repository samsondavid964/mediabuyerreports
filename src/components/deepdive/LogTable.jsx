'use client'

import { useState, useMemo } from 'react'
import { signalConfig } from '@/lib/signalConfig'

function SignalPill({ signal }) {
    const cfg = signalConfig[signal] || { color: '#64748b', bg: '#111111', label: signal }
    return (
        <span className="signal-pill text-xs" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
            {cfg.label}
        </span>
    )
}

function ExpandableCell({ text, maxLen = 80 }) {
    const [expanded, setExpanded] = useState(false)
    if (!text || text === '-') return <span style={{ color: '#222222' }}>—</span>
    const isLong = text.length > maxLen
    return (
        <div>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>
                {expanded || !isLong ? text : `${text.slice(0, maxLen)}…`}
            </span>
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="ml-1 text-xs"
                    style={{ color: '#00e5cc', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                >
                    {expanded ? 'less' : 'more'}
                </button>
            )}
        </div>
    )
}

export default function LogTable({ logs }) {
    const [sortKey, setSortKey] = useState('date')
    const [sortDir, setSortDir] = useState('desc')

    const sorted = useMemo(() => {
        return [...logs].sort((a, b) => {
            const av = a[sortKey] || ''
            const bv = b[sortKey] || ''
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        })
    }, [logs, sortKey, sortDir])

    const handleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        else { setSortKey(key); setSortDir('desc') }
    }

    const SortIcon = ({ col }) => (
        <span style={{ color: sortKey === col ? '#00e5cc' : '#222222', marginLeft: 4, fontSize: 10 }}>
            {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    )

    const columns = [
        { key: 'date', label: 'Date', sortable: true },
        { key: 'performance_signal', label: 'Signal', sortable: true },
        { key: 'successes', label: 'Successes', sortable: false },
        { key: 'blockers_problems', label: 'Blockers', sortable: false },
        { key: 'account_changes', label: 'Account Changes', sortable: false },
        { key: 'planned_for_tomorrow', label: 'Planned', sortable: false },
    ]

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                Log History
                <span className="ml-2 text-xs" style={{ color: '#64748b' }}>({sorted.length} entries)</span>
            </h3>
            {sorted.length === 0 ? (
                <div className="flex items-center justify-center py-12" style={{ color: '#64748b' }}>No logs for this client</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                        style={{ cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}
                                    >
                                        {col.label}
                                        {col.sortable && <SortIcon col={col.key} />}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ whiteSpace: 'nowrap', color: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>{log.date}</td>
                                    <td><SignalPill signal={log.performance_signal} /></td>
                                    <td><ExpandableCell text={log.successes} /></td>
                                    <td><ExpandableCell text={log.blockers_problems} /></td>
                                    <td><ExpandableCell text={log.account_changes} /></td>
                                    <td><ExpandableCell text={log.planned_for_tomorrow} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
