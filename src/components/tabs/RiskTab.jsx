'use client'

import AtRiskTable from '@/components/risk/AtRiskTable'
import { SkeletonTable } from '@/components/SkeletonLoader'

export default function RiskTab({ logs, loading }) {
    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonTable rows={6} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AtRiskTable logs={logs} />
        </div>
    )
}
