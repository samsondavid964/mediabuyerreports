'use client'

import KPITiles from '@/components/summary/KPITiles'
import SignalDonut from '@/components/summary/SignalDonut'
import ActivityFeed from '@/components/summary/ActivityFeed'
import { SkeletonCard, SkeletonChart } from '@/components/SkeletonLoader'

export default function SummaryTab({ logs, loading }) {
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonChart height="280px" />
                    <SkeletonChart height="280px" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <KPITiles logs={logs} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SignalDonut logs={logs} />
                <ActivityFeed logs={logs} />
            </div>
        </div>
    )
}
