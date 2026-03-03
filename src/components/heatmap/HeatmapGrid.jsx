'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { signalConfig, isSubstantive } from '@/lib/signalConfig'

const SIGNAL_COLORS = {
    'Performing Well': '#4ade80',
    'Mixed/Watching': '#f5c842',
    'Underperforming': '#ff4d6d',
    'At Risk/Possible Churn': '#dc2626',
}

function Tooltip({ log, visible, x, y }) {
    if (!visible || !log) return null
    const cfg = signalConfig[log.performance_signal] || {}
    return (
        <div
            className="fixed z-50 pointer-events-none"
            style={{ left: Math.min(x + 12, window.innerWidth - 270), top: y + 12, width: 260 }}
        >
            <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f1f5f9', marginBottom: 4, fontSize: 14 }}>{log.client_name}</div>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8 }}>{log.date}</div>
                <span className="signal-pill" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, fontSize: 11, marginBottom: 10, display: 'inline-flex' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                    {cfg.label}
                </span>
                {isSubstantive(log.successes) && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                        <span style={{ color: '#4ade80', marginRight: 4 }}>✅</span>
                        <span className="line-clamp-2">{log.successes}</span>
                    </div>
                )}
                {isSubstantive(log.blockers_problems) && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                        <span style={{ color: '#ff4d6d', marginRight: 4 }}>🚧</span>
                        <span className="line-clamp-2">{log.blockers_problems}</span>
                    </div>
                )}
                {!isSubstantive(log.successes) && !isSubstantive(log.blockers_problems) && (
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>Click to view full log</div>
                )}
            </div>
        </div>
    )
}

export default function HeatmapGrid({ logs, onCellClick, dateRange }) {
    const [hoveredLog, setHoveredLog] = useState(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

    const { clients, dates, grid } = useMemo(() => {
        const clientSet = new Set()
        const logMap = {}

        logs.forEach((log) => {
            clientSet.add(log.client_name)
            const key = `${log.client_name}|${log.date}`
            logMap[key] = log
        })

        const clients = [...clientSet].sort()

        // Generate every calendar day in the selected range
        const dates = []
        if (dateRange?.start && dateRange?.end) {
            const cursor = new Date(dateRange.start + 'T00:00:00')
            const end = new Date(dateRange.end + 'T00:00:00')
            while (cursor <= end) {
                dates.push(cursor.toISOString().split('T')[0])
                cursor.setDate(cursor.getDate() + 1)
            }
        } else {
            // fallback: only dates from logs
            const dateSet = new Set(logs.map((l) => l.date))
            dates.push(...[...dateSet].sort())
        }

        const grid = {}
        clients.forEach((c) => {
            grid[c] = {}
            dates.forEach((d) => {
                grid[c][d] = logMap[`${c}|${d}`] || null
            })
        })

        return { clients, dates, grid }
    }, [logs, dateRange])

    const consistencyScore = useMemo(() => {
        const scores = {}
        clients.forEach((c) => {
            const clientLogs = logs.filter((l) => l.client_name === c)
            if (!clientLogs.length) { scores[c] = null; return }
            const well = clientLogs.filter((l) => l.performance_signal === 'Performing Well').length
            scores[c] = Math.round((well / clientLogs.length) * 100)
        })
        return scores
    }, [clients, logs])

    return (
        <div className="glass-card p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h3 className="text-base font-semibold" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                    Client × Date Heatmap
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                    {Object.entries(SIGNAL_COLORS).map(([sig, color]) => (
                        <div key={sig} className="flex items-center gap-1.5">
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                            <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                                {signalConfig[sig]?.label}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }} />
                        <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>No log</span>
                    </div>
                </div>
            </div>

            {clients.length === 0 ? (
                <div className="flex items-center justify-center h-64" style={{ color: '#64748b' }}>No data</div>
            ) : (
                <div className="overflow-x-auto">
                    <div style={{ minWidth: 600 }}>
                        {/* Header row */}
                        <div className="flex items-center gap-1 mb-1" style={{ paddingLeft: 140 }}>
                            {dates.map((d) => (
                                <div
                                    key={d}
                                    style={{
                                        flex: '1 1 0', minWidth: 28, textAlign: 'center', fontSize: 9,
                                        color: '#475569', fontFamily: 'Inter, sans-serif',
                                        transform: 'rotate(-45deg)',
                                        transformOrigin: 'left bottom',
                                        height: 40,
                                        display: 'flex', alignItems: 'flex-end',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {d.slice(5)}
                                </div>
                            ))}
                            <div style={{ width: 72, flexShrink: 0, textAlign: 'center', fontSize: 9, color: '#475569', fontFamily: 'Syne, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</div>
                        </div>

                        {/* Rows */}
                        {clients.map((client) => (
                            <div key={client} className="flex items-center gap-1 mb-1">
                                <div
                                    style={{
                                        width: 132, flexShrink: 0, fontSize: 12, color: '#94a3b8',
                                        fontFamily: 'Inter, sans-serif', textAlign: 'right',
                                        paddingRight: 8, whiteSpace: 'nowrap', overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                    title={client}
                                >
                                    {client}
                                </div>
                                {dates.map((date) => {
                                    const log = grid[client][date]
                                    const color = log ? SIGNAL_COLORS[log.performance_signal] || '#222222' : null
                                    return (
                                        <div
                                            key={date}
                                            className="heatmap-cell"
                                            style={{
                                                flex: '1 1 0',
                                                minWidth: 28,
                                                width: 'auto',
                                                height: 28,
                                                background: color || '#111111',
                                                border: color ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.04)',
                                                opacity: color ? 1 : 0.4,
                                            }}
                                            onMouseEnter={(e) => {
                                                setHoveredLog(log)
                                                setTooltipPos({ x: e.clientX, y: e.clientY })
                                            }}
                                            onMouseLeave={() => setHoveredLog(null)}
                                            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                                            onClick={() => log && onCellClick(log)}
                                        />
                                    )
                                })}
                                {/* Consistency score */}
                                <div style={{ width: 72, flexShrink: 0, textAlign: 'center' }}>
                                    {consistencyScore[client] !== null ? (
                                        <span
                                            className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                            style={{
                                                fontFamily: 'Inter, sans-serif',
                                                background: consistencyScore[client] >= 70 ? 'rgba(74,222,128,0.12)' : consistencyScore[client] >= 40 ? 'rgba(245,200,66,0.12)' : 'rgba(255,77,109,0.12)',
                                                color: consistencyScore[client] >= 70 ? '#4ade80' : consistencyScore[client] >= 40 ? '#f5c842' : '#ff4d6d',
                                            }}
                                        >
                                            {consistencyScore[client]}%
                                        </span>
                                    ) : (
                                        <span style={{ color: '#222222', fontSize: 11 }}>—</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Tooltip log={hoveredLog} visible={!!hoveredLog} x={tooltipPos.x} y={tooltipPos.y} />
        </div>
    )
}
