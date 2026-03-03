'use client'

import HealthTimeline from '@/components/performance/HealthTimeline'
import SignalStackedBar from '@/components/performance/SignalStackedBar'
import ClientTrends from '@/components/performance/ClientTrends'
import { SkeletonChart } from '@/components/SkeletonLoader'

export default function PerformanceTab({ logs, dateRange, loading }) {
    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonChart height="300px" />
                <SkeletonChart height="280px" />
                <SkeletonChart height="300px" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <HealthTimeline logs={logs} />
            <SignalStackedBar logs={logs} dateRange={dateRange} />
            <ClientTrends logs={logs} />
        </div>
    )
}
