'use client'

import { useMemo, useEffect, useState } from 'react'
import { getHealthScore, isSubstantive, signalConfig } from '@/lib/signalConfig'

function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (target === null || target === undefined) return
        let start = null
        const startVal = 0
        const step = (timestamp) => {
            if (!start) start = timestamp
            const progress = Math.min((timestamp - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(startVal + eased * (target - startVal)))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        return () => { start = -Infinity }
    }, [target, duration])
    return count
}

function SignalCard({ signalType, count, percentage, icon, accentColor, delay = 0 }) {
    const animatedCount = useCountUp(typeof count === 'number' ? count : null)

    return (
        <div
            className="elevated-card p-6 flex flex-col gap-3 animate-fade-in-up relative overflow-hidden h-full"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-2">
                <div style={{ color: accentColor }}>
                    {icon}
                </div>
                <div className="text-sm font-bold" style={{ color: accentColor, fontFamily: 'Syne, sans-serif' }}>
                    {percentage}%
                </div>
            </div>

            <div className="flex flex-col mt-auto">
                <span className="text-4xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)', lineHeight: 1 }}>
                    {typeof count === 'number' ? animatedCount : count}
                </span>
                <span className="text-sm tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    {signalType}
                </span>
            </div>
        </div>
    )
}

export default function SignalCards({ logs }) {
    const stats = useMemo(() => {
        const totalLogs = logs.length || 1 // Avoid division by zero

        let performingWell = 0;
        let mixedWatching = 0;
        let underperforming = 0;
        let atRisk = 0;

        logs.forEach(log => {
            if (log.performance_signal === 'Performing Well') performingWell++;
            else if (log.performance_signal === 'Mixed/Watching') mixedWatching++;
            else if (log.performance_signal === 'Underperforming') underperforming++;
            else if (log.performance_signal === 'At Risk/Possible Churn') atRisk++;
        });

        return {
            performingWell: {
                count: performingWell,
                percentage: Math.round((performingWell / totalLogs) * 100)
            },
            mixedWatching: {
                count: mixedWatching,
                percentage: Math.round((mixedWatching / totalLogs) * 100)
            },
            underperforming: {
                count: underperforming,
                percentage: Math.round((underperforming / totalLogs) * 100)
            },
            atRisk: {
                count: atRisk,
                percentage: Math.round((atRisk / totalLogs) * 100)
            }
        }
    }, [logs])

    const cards = [
        {
            signalType: 'Performing Well',
            count: stats.performingWell.count,
            percentage: stats.performingWell.percentage,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            ),
            accentColor: 'var(--accent-green)', // #4ade80
        },
        {
            signalType: 'Mixed / Watching',
            count: stats.mixedWatching.count,
            percentage: stats.mixedWatching.percentage,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            ),
            accentColor: 'var(--accent-yellow)', // #f5c842
        },
        {
            signalType: 'Underperforming',
            count: stats.underperforming.count,
            percentage: stats.underperforming.percentage,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
            ),
            accentColor: '#ff8a00', // Matches the orange arrow in image
        },
        {
            signalType: 'At Risk',
            count: stats.atRisk.count,
            percentage: stats.atRisk.percentage,
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            ),
            accentColor: 'var(--accent-coral)', // #ff4d6d or #dc2626
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 stagger-children">
            {cards.map((card, i) => (
                <SignalCard key={card.signalType} {...card} delay={i * 80 + 200} />
            ))}
        </div>
    )
}
