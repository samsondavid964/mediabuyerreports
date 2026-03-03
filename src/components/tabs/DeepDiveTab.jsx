'use client'

import { useMemo, useState } from 'react'
import ClientTimeline from '@/components/deepdive/ClientTimeline'
import LogTable from '@/components/deepdive/LogTable'
import ClientStats from '@/components/deepdive/ClientStats'
import { SkeletonChart, SkeletonTable } from '@/components/SkeletonLoader'

export default function DeepDiveTab({ logs, loading }) {
    const clients = useMemo(() => {
        const counts = {}
        logs.forEach((l) => { counts[l.client_name] = (counts[l.client_name] || 0) + 1 })
        return Object.keys(counts).sort((a, b) => a.localeCompare(b))
    }, [logs])

    const [selectedClient, setSelectedClient] = useState('')

    const clientLogs = useMemo(() => {
        const client = selectedClient || clients[0]
        return logs.filter((l) => l.client_name === client)
    }, [logs, selectedClient, clients])

    const activeClient = selectedClient || clients[0]

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-10 w-64 rounded-xl" />
                <SkeletonChart height="280px" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SkeletonChart height="220px" className="lg:col-span-1" />
                </div>
                <SkeletonTable rows={5} />
            </div>
        )
    }

    if (!clients.length) {
        return (
            <div className="glass-card p-12 text-center">
                <p style={{ color: '#64748b' }}>No data available for the selected date range.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Client Selector */}
            <div className="glass-card p-4 flex items-center gap-4 flex-wrap">
                <span className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: '#94a3b8' }}>
                    Select Client:
                </span>
                <select
                    value={activeClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="px-4 py-2 rounded-xl text-sm outline-none transition-all duration-300"
                    style={{
                        background: '#111111',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#f1f5f9',
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        minWidth: 200,
                    }}
                >
                    {clients.map((c) => (
                        <option key={c} value={c} style={{ background: '#111111' }}>{c}</option>
                    ))}
                </select>
                <span style={{ color: '#00e5cc', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                    {clientLogs.length} log entries
                </span>
                {clientLogs.length > 0 && (
                    <span style={{ color: '#64748b', fontSize: 12 }}>
                        {clientLogs[0]?.date} → {clientLogs[clientLogs.length - 1]?.date}
                    </span>
                )}
            </div>

            {/* Charts + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ClientTimeline logs={clientLogs} />
                </div>
                <ClientStats logs={clientLogs} />
            </div>

            {/* Log Table */}
            <LogTable logs={clientLogs} />
        </div>
    )
}
