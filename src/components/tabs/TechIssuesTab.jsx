'use client'

import TechIssues from '@/components/risk/TechIssues'
import { SkeletonChart } from '@/components/SkeletonLoader'

export default function TechIssuesTab({ logs, loading }) {
    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonChart height="400px" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <TechIssues logs={logs} />
        </div>
    )
}
