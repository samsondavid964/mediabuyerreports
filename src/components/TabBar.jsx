'use client'

import { useRef, useEffect, useState } from 'react'

const tabs = [
    { id: 'summary', label: 'Summary', icon: '◉' },
    { id: 'performance', label: 'Performance Overview', icon: '◈' },
    { id: 'heatmap', label: 'Heatmap', icon: '▦' },
    { id: 'risk', label: 'Risk Radar', icon: '⚠' },
    { id: 'deepdive', label: 'Deep Dive', icon: '⬡' },
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
        <nav className="relative px-6 pt-2" style={{ background: 'rgba(5, 5, 5, 0.95)' }}>
            <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide relative">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        ref={(el) => (tabRefs.current[tab.id] = el)}
                        onClick={() => onTabChange(tab.id)}
                        className="relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 rounded-t-xl"
                        style={{
                            fontFamily: 'Syne, sans-serif',
                            color: activeTab === tab.id ? '#00e5cc' : '#64748b',
                            background: activeTab === tab.id ? 'rgba(0, 229, 204, 0.06)' : 'transparent',
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
                        background: 'linear-gradient(90deg, #00e5cc, #00b4d8)',
                        borderRadius: '2px 2px 0 0',
                    }}
                />
            </div>
            <div className="h-[1px]" style={{ background: 'var(--border-subtle)' }} />
        </nav>
    )
}
