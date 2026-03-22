'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SkeletonTable } from '@/components/SkeletonLoader'

export default function GmcIssuesTab({ logs, loading }) {
    const [resolutions, setResolutions] = useState([])
    const [fetchingRezzies, setFetchingRezzies] = useState(true)
    const [submitting, setSubmitting] = useState(null)
    const [error, setError] = useState(null)

    const fetchResolutions = async () => {
        try {
            setFetchingRezzies(true)
            const { data, error } = await supabase
                .from('gmc_issues')
                .select('*')
                .order('resolved_at', { ascending: false })
            
            if (error) {
                // If table doesn't exist yet, don't crash, just gracefully show empty
                if (error.code === '42P01') {
                    setResolutions([])
                } else {
                    console.error("GMC Fetch error:", error)
                }
            } else {
                setResolutions(data || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setFetchingRezzies(false)
        }
    }

    useEffect(() => {
        fetchResolutions()
    }, [])

    const { pendingIssues, resolvedIssues } = useMemo(() => {
        if (!logs) return { pendingIssues: [], resolvedIssues: [] }

        // Find all logs mentioning GMC
        const gmcLogs = logs.filter(l => {
            const tech = (l.tech_setup_issues || '').toLowerCase()
            const block = (l.blockers_problems || '').toLowerCase()
            return tech.includes('gmc') || block.includes('gmc')
        })

        // Group by client to find the earliest report in this window
        const clientReportDates = {}
        for (const log of gmcLogs) {
            const date = new Date(log.date)
            if (!clientReportDates[log.client_name] || date < new Date(clientReportDates[log.client_name])) {
                clientReportDates[log.client_name] = log.date
            }
        }

        // Get the latest resolution date for each client
        const latestResolutions = {}
        for (const res of resolutions) {
            if (res.status === 'resolved' && res.resolved_at) {
                const rDate = new Date(res.resolved_at)
                if (!latestResolutions[res.client_name] || rDate > latestResolutions[res.client_name]) {
                    latestResolutions[res.client_name] = rDate
                }
            }
        }

        const pending = []
        const today = new Date()

        for (const [client_name, reported_str] of Object.entries(clientReportDates)) {
            const reportedDate = new Date(reported_str)
            const resDate = latestResolutions[client_name]

            // If there's no resolution, or the resolution happened BEFORE this new report
            // wait, we must also ensure that the resolution isn't on the same day if we consider it newly reported.
            // Simplified: if report > resDate, it's pending.
            // If they are equal, it might be tricky. Let's use > or if resDate is null
            if (!resDate || reportedDate > resDate) {
                const diffTime = Math.abs(today - reportedDate)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                
                pending.push({
                    client_name,
                    reported_at: reported_str,
                    daysPending: diffDays
                })
            }
        }

        // Resolved issues can just be taken from the resolutions table
        const resolved = resolutions.filter(r => r.status === 'resolved').map(r => {
            const rDate = new Date(r.reported_at)
            const resDate = new Date(r.resolved_at)
            const diffTime = Math.abs(resDate - rDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            return {
                id: r.id,
                client_name: r.client_name,
                reported_at: r.reported_at,
                resolved_at: r.resolved_at,
                daysTaken: diffDays
            }
        })

        // Sort pending by longest waiting first
        pending.sort((a, b) => b.daysPending - a.daysPending)

        return { pendingIssues: pending, resolvedIssues: resolved }
    }, [logs, resolutions])

    const handleResolve = async (issue) => {
        setSubmitting(issue.client_name)
        try {
            const { error } = await supabase
                .from('gmc_issues')
                .insert([{
                    client_name: issue.client_name,
                    status: 'resolved',
                    reported_at: issue.reported_at,
                    resolved_at: new Date().toISOString()
                }])
            
            if (error) {
                setError(error.message)
                if (error.code === '42P01') {
                    // Provide helpful instructions if table doesn't exist
                    setError("The 'gmc_issues' Supabase table does not exist. Please create it first.")
                }
            } else {
                fetchResolutions()
            }
        } catch (err) {
            setError("Failed to resolve issue.")
        } finally {
            setSubmitting(null)
        }
    }

    if (loading || fetchingRezzies) {
        return (
            <div className="space-y-6">
                <SkeletonTable rows={4} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(255, 107, 107, 0.1)', color: 'var(--accent-coral)', border: '1px solid var(--accent-coral)' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Issues */}
                <div className="glass-card p-6 animate-fade-in-up">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent-yellow)' }}>
                        <span className="text-xl">⏳</span> Pending GMC Issues
                        <span className="ml-auto text-xs px-2 py-1 rounded" style={{ background: 'rgba(245,200,66,0.1)', color: 'inherit' }}>
                            {pendingIssues.length} active
                        </span>
                    </h3>
                    
                    {pendingIssues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--text-muted)' }}>
                            <div className="text-3xl mb-3">✅</div>
                            <p className="text-sm">No pending GMC bottlenecks detected in logs.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {pendingIssues.map(issue => (
                                <div key={issue.client_name} className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                                    <div>
                                        <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{issue.client_name}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            Reported: {issue.reported_at} 
                                            <span className="ml-2 font-medium" style={{ color: 'var(--accent-coral)' }}>({issue.daysPending} days ago)</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleResolve(issue)}
                                        disabled={submitting === issue.client_name}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                                        style={{ 
                                            background: submitting === issue.client_name ? 'var(--bg-surface)' : 'var(--accent-teal-bg)', 
                                            color: submitting === issue.client_name ? 'var(--text-muted)' : 'var(--accent-teal)',
                                            border: '1px solid var(--border-glow)'
                                        }}
                                    >
                                        {submitting === issue.client_name ? 'Resolving...' : 'Mark Resolved'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resolved Issues */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent-green)' }}>
                        <span className="text-xl">✅</span> Resolved GMC Issues
                        <span className="ml-auto text-xs px-2 py-1 rounded" style={{ background: 'rgba(57, 255, 160, 0.1)', color: 'inherit' }}>
                            {resolvedIssues.length} total
                        </span>
                    </h3>
                    
                    {resolvedIssues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10" style={{ color: 'var(--text-muted)' }}>
                            <p className="text-sm">No resolved issues tracked yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {resolvedIssues.map(issue => (
                                <div key={issue.id} className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(57, 255, 160, 0.03)', border: '1px solid rgba(57, 255, 160, 0.1)' }}>
                                    <div>
                                        <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>{issue.client_name}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            Reported: {issue.reported_at} • Resolved: {new Date(issue.resolved_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold px-2 py-1 rounded" style={{ background: 'rgba(57, 255, 160, 0.1)', color: 'var(--accent-green)' }}>
                                        Took {issue.daysTaken} days
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
