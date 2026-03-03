'use client'

import { useState } from 'react'
import HeatmapGrid from '@/components/heatmap/HeatmapGrid'
import LogSlideOver from '@/components/heatmap/LogSlideOver'
import RecentWins from '@/components/heatmap/RecentWins'
import { SkeletonChart } from '@/components/SkeletonLoader'

export default function HeatmapTab({ logs, loading, dateRange }) {
    const [selectedLog, setSelectedLog] = useState(null)

    if (loading) return (
        <div className="space-y-6">
            <SkeletonChart height="500px" />
            <SkeletonChart height="200px" />
        </div>
    )

    return (
        <div className="space-y-6">
            <HeatmapGrid logs={logs} onCellClick={setSelectedLog} dateRange={dateRange} />
            <RecentWins logs={logs} />
            <LogSlideOver log={selectedLog} onClose={() => setSelectedLog(null)} />
        </div>
    )
}
