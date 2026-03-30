'use client'

import { useMemo, useState } from 'react'
import { SkeletonTable } from '@/components/SkeletonLoader'
import { CHURN_THRESHOLD_DAYS } from '@/lib/constants'

export default function ChurnTab({ logs, loading, dateRange }) {
    const [sortKey, setSortKey] = useState('daysSince')
    const [sortDir, setSortDir] = useState('desc')

    const churnedClients = useMemo(() => {
        if (!logs) return []

        // Find the latest log date for each client (within the fetched range)
        // Note: logs are fetched using startDate and endDate defaults
        const latestLogs = logs.reduce((acc, log) => {
            const currentLatest = acc[log.client_name]
            if (!currentLatest || new Date(log.date) > new Date(currentLatest.date)) {
                acc[log.client_name] = log
            }
            return acc
        }, {})

        const today = new Date()
        // Standardize today to ignoring hours if needed
        today.setHours(0, 0, 0, 0)

        const churned = []
        for (const [client_name, log] of Object.entries(latestLogs)) {
            const logDate = new Date(log.date)
            logDate.setHours(0, 0, 0, 0)
            const diffTime = Math.abs(today - logDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays > CHURN_THRESHOLD_DAYS) {
                churned.push({
                    client_name,
                    lastDate: log.date,
                    daysSince: diffDays
                })
            }
        }

        return churned.sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]
            
            if (sortKey === 'daysSince') {
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal
            } else {
                return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal))
            }
        })
    }, [logs, sortKey, sortDir])

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
                <SkeletonTable rows={5} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                        Churned Clients
                        <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>(&gt; {CHURN_THRESHOLD_DAYS} days since last EOD)</span>
                    </h3>
                </div>

                {churnedClients.length === 0 ? (
                    <div className="flex items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>
                        <div className="text-center">
                            <div className="text-3xl mb-2">🎉</div>
                            <p>No churned clients found in the selected date range.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('client_name')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        Client {renderSortIcon('client_name')}
                                    </th>
                                    <th onClick={() => handleSort('lastDate')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        Last Log Date {renderSortIcon('lastDate')}
                                    </th>
                                    <th onClick={() => handleSort('daysSince')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                        Days Since Last Log {renderSortIcon('daysSince')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {churnedClients.map((client) => (
                                    <tr key={client.client_name}>
                                        <td>
                                            <span style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 16 }}>
                                                {client.client_name}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                                            {client.lastDate}
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'rgba(255, 107, 107, 0.1)',
                                                color: 'var(--accent-coral)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                fontWeight: 600
                                            }}>
                                                {client.daysSince} days
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
