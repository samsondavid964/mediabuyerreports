'use client'

import { useRef, useEffect, useState } from 'react'

const tabs = [
    { id: 'summary', label: 'Summary', icon: '◉' },
    { id: 'performance', label: 'Performance', icon: '◈' },
    { id: 'heatmap', label: 'Heatmap', icon: '▦' },
    { id: 'risk', label: 'Risk Radar', icon: '⚠' },
    { id: 'clientdeepdive', label: 'Client Deep Dive', icon: '🔍' },
    { id: 'techissues', label: 'Tech Issues', icon: '⚙' },
    { id: 'alldata', label: 'All Data', icon: '⬡' },
    { id: 'churned', label: 'Churned', icon: '📉' },
    { id: 'gmcissues', label: 'GMC Issues', icon: '⏳' },
]

export default function TabBar({ activeTab, onTabChange }) {
    const tabRefs = useRef({})
    const [indicator, setIndicator] = useState({ left: 0, width: 0 })

    useEffect(() => {
        const el = tabRefs.current[activeTab]
        if (el) {
            const parent = el.parentElement
            setIndicator({
                left: el.offsetLeft - parent.offsetLeft,
                width: el.offsetWidth,
            })
        }
    }, [activeTab])

    return (
        <nav className="relative px-6 pt-2" style={{ background: 'var(--glass-bg)' }}>
            <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide relative">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        ref={(el) => (tabRefs.current[tab.id] = el)}
                        onClick={() => onTabChange(tab.id)}
                        className="relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-t-xl"
                        style={{
                            fontFamily: 'Syne, sans-serif',
                            color: activeTab === tab.id ? 'var(--accent-teal)' : 'var(--text-muted)',
                            background: activeTab === tab.id ? 'var(--accent-teal-bg)' : 'transparent',
                        }}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
                <div
                    className="absolute bottom-0 h-[2px] tab-indicator"
                    style={{
                        left: indicator.left,
                        width: indicator.width,
                        background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-blue))',
                        borderRadius: '2px 2px 0 0',
                    }}
                />
            </div>
            <div className="h-[1px]" style={{ background: 'var(--border-subtle)' }} />
        </nav>
    )
}
