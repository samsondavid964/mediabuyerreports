'use client'

import AtRiskTable from '@/components/risk/AtRiskTable'
import TechIssues from '@/components/risk/TechIssues'
import BlockersChart from '@/components/risk/BlockersChart'
import { SkeletonTable, SkeletonChart } from '@/components/SkeletonLoader'

export default function RiskTab({ logs, loading }) {
    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonTable rows={6} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SkeletonChart height="280px" />
                    <SkeletonChart height="280px" />
                    <SkeletonChart height="280px" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AtRiskTable logs={logs} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TechIssues logs={logs} />
                <BlockersChart
                    logs={logs}
                    field="blockers_problems"
                    title="Top Blocker Keywords"
                />
                <BlockersChart
                    logs={logs}
                    field="waiting_on"
                    title="Waiting On — Top Keywords"
                />
            </div>
        </div>
    )
}
