'use client'

import React, { useState, useMemo } from 'react'
import { signalConfig, signalOrder } from '@/lib/signalConfig'
import { SkeletonTable } from '@/components/SkeletonLoader'

function SignalPill({ signal }) {
    const cfg = signalConfig[signal] || { color: 'var(--text-muted)', bg: 'var(--bg-surface)', label: signal }
    return (
        <span className="signal-pill text-sm" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
            {cfg.label}
        </span>
    )
}

function ExpandableCell({ text, maxLen = 80 }) {
    const [expanded, setExpanded] = useState(false)
    if (!text || text === '-') return <span style={{ color: 'var(--text-invisible)' }}>—</span>
    const isLong = text.length > maxLen
    return (
        <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {expanded || !isLong ? text : `${text.slice(0, maxLen)}…`}
            </span>
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="ml-1 text-sm"
                    style={{ color: 'var(--accent-teal)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                >
                    {expanded ? 'less' : 'more'}
                </button>
            )}
        </div>
    )
}

export default function AllDataTab({ logs, loading }) {
    const [clientFilter, setClientFilter] = useState('')
    const [signalFilter, setSignalFilter] = useState('')
    const [keyword, setKeyword] = useState('')
    const [sortKey, setSortKey] = useState('date')
    const [sortDir, setSortDir] = useState('desc')
    const [expandedClients, setExpandedClients] = useState({})

    const toggleClient = (client) => {
        setExpandedClients(prev => ({
            ...prev,
            [client]: !prev[client]
        }))
    }

    const clients = useMemo(() => {
        return [...new Set(logs.map((l) => l.client_name))].sort()
    }, [logs])

    const filtered = useMemo(() => {
        let result = logs
        if (clientFilter) result = result.filter((l) => l.client_name === clientFilter)
        if (signalFilter) result = result.filter((l) => l.performance_signal === signalFilter)
        if (keyword.trim()) {
            const kw = keyword.toLowerCase()
            result = result.filter((l) => {
                return (
                    (l.client_name || '').toLowerCase().includes(kw) ||
                    (l.successes || '').toLowerCase().includes(kw) ||
                    (l.blockers_problems || '').toLowerCase().includes(kw) ||
                    (l.account_changes || '').toLowerCase().includes(kw) ||
                    (l.planned_for_tomorrow || '').toLowerCase().includes(kw) ||
                    (l.waiting_on || '').toLowerCase().includes(kw) ||
                    (l.tech_setup_issues || '').toLowerCase().includes(kw)
                )
            })
        }
        return [...result].sort((a, b) => {
            const av = a[sortKey] || ''
            const bv = b[sortKey] || ''
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        })
    }, [logs, clientFilter, signalFilter, keyword, sortKey, sortDir])

    const handleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        else { setSortKey(key); setSortDir('desc') }
    }

    const renderSortIcon = (col) => (
        <span style={{ color: sortKey === col ? 'var(--accent-teal)' : 'var(--text-invisible)', marginLeft: 4, fontSize: 10 }}>
            {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    )

    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonTable rows={10} />
            </div>
        )
    }

    const selectStyle = {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        padding: '8px 12px',
        borderRadius: 10,
        fontFamily: 'Inter, sans-serif',
        fontSize: 13,
        cursor: 'pointer',
        outline: 'none',
        minWidth: 160,
    }

    const columns = [
        { key: 'date', label: 'Date', sortable: true },
        { key: 'client_name', label: 'Client', sortable: true },
        { key: 'performance_signal', label: 'Signal', sortable: true },
        { key: 'successes', label: 'Successes', sortable: false },
        { key: 'blockers_problems', label: 'Blockers', sortable: false },
        { key: 'account_changes', label: 'Account Changes', sortable: false },
        { key: 'planned_for_tomorrow', label: 'Planned', sortable: false },
        { key: 'waiting_on', label: 'Waiting On', sortable: false },
        { key: 'tech_setup_issues', label: 'Tech Issues', sortable: false },
    ]

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="glass-card p-4 flex items-center gap-4 flex-wrap">
                <span className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-secondary)' }}>
                    Filters:
                </span>
                <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} style={selectStyle}>
                    <option value="" style={{ background: 'var(--bg-surface)' }}>All Clients</option>
                    {clients.map((c) => (
                        <option key={c} value={c} style={{ background: 'var(--bg-surface)' }}>{c}</option>
                    ))}
                </select>
                <select value={signalFilter} onChange={(e) => setSignalFilter(e.target.value)} style={selectStyle}>
                    <option value="" style={{ background: 'var(--bg-surface)' }}>All Signals</option>
                    {signalOrder.map((s) => (
                        <option key={s} value={s} style={{ background: 'var(--bg-surface)' }}>{signalConfig[s].label}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Search keyword..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none transition-all duration-300"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        minWidth: 180,
                    }}
                />
                <span style={{ color: 'var(--accent-teal)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                    {filtered.length} results
                </span>
            </div>

            {/* Data table */}
            <div className="glass-card p-6 animate-fade-in-up">
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                    All Data
                    <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>({filtered.length} entries)</span>
                </h3>
                {filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>No matching records found</div>
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
                                            {col.sortable && renderSortIcon(col.key)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(
                                    filtered.reduce((acc, log) => {
                                        if (!acc[log.client_name]) acc[log.client_name] = [];
                                        acc[log.client_name].push(log);
                                        return acc;
                                    }, {})
                                ).sort(([clientA], [clientB]) => clientA.localeCompare(clientB))
                                .map(([client, clientLogs]) => (
                                    <React.Fragment key={client}>
                                        <tr 
                                            style={{ background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}
                                            onClick={() => toggleClient(client)}
                                        >
                                            <td colSpan={columns.length} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-semibold text-base" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent-teal)' }}>
                                                            {client}
                                                        </span>
                                                        <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                                            ({clientLogs.length} entries)
                                                        </span>
                                                    </div>
                                                    <span style={{ color: 'var(--accent-teal)', fontSize: '12px', fontWeight: 600 }}>
                                                        {expandedClients[client] ? '▼ Collapse' : '▶ Expand'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedClients[client] && clientLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td style={{ whiteSpace: 'nowrap', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>{log.date}</td>
                                                <td>
                                                    <span style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 15 }}>{log.client_name}</span>
                                                </td>
                                                <td><SignalPill signal={log.performance_signal} /></td>
                                                <td><ExpandableCell text={log.successes} /></td>
                                                <td><ExpandableCell text={log.blockers_problems} /></td>
                                                <td><ExpandableCell text={log.account_changes} /></td>
                                                <td><ExpandableCell text={log.planned_for_tomorrow} /></td>
                                                <td><ExpandableCell text={log.waiting_on} /></td>
                                                <td><ExpandableCell text={log.tech_setup_issues} /></td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
