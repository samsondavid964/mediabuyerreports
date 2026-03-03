'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { isSubstantive } from '@/lib/signalConfig'

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'as', 'by', 'is', 'was', 'are', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'it', 'its', 'this', 'that', 'these', 'those',
    'not', 'no', 'from', 'we', 'i', 'they', 'he', 'she', 'our', 'all',
    'some', 'any', 'if', 'so', 'still', 'also', 'up', 'out', 'need', 'still',
    'very', 'more', 'can', 'now', 'just', 'been', 'into',
])

function extractKeywords(texts) {
    const counts = {}
    texts.forEach((text) => {
        if (!isSubstantive(text)) return
        const words = text
            .toLowerCase()
            .replace(/[^a-z0-9\s/-]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

        // Look for 2-word phrases first
        for (let i = 0; i < words.length - 1; i++) {
            const phrase = `${words[i]} ${words[i + 1]}`
            if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1])) {
                counts[phrase] = (counts[phrase] || 0) + 1
            }
        }
        words.forEach((w) => {
            counts[w] = (counts[w] || 0) + 1
        })
    })

    // Filter out single words that are fully covered by top phrases
    const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 14)

    const topPhrases = sorted.filter(([k]) => k.includes(' ')).slice(0, 6)
    const phraseWords = new Set(topPhrases.flatMap(([k]) => k.split(' ')))
    const result = sorted.filter(([k]) => k.includes(' ') || !phraseWords.has(k)).slice(0, 10)

    return result.map(([keyword, count]) => ({ keyword, count }))
}

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ color: '#f1f5f9', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>{payload[0].payload.keyword}</div>
            <div style={{ color: '#00e5cc', fontSize: 12 }}>{payload[0].value} mentions</div>
        </div>
    )
}

export default function BlockersChart({ logs, field = 'blockers_problems', title = 'Top Blocker Keywords' }) {
    const data = useMemo(() => {
        return extractKeywords(logs.map((l) => l[field]))
    }, [logs, field])

    return (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>{title}</h3>
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-48" style={{ color: '#64748b' }}>No data</div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                        <XAxis
                            type="number"
                            tick={{ fill: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="keyword"
                            tick={{ fill: '#94a3b8', fontFamily: 'Inter, sans-serif', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={20} isAnimationActive={true} animationDuration={800}>
                            {data.map((entry, i) => (
                                <Cell
                                    key={entry.keyword}
                                    fill={`rgba(255,77,109,${1 - i * 0.08})`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
