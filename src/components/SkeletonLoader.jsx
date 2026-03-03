'use client'

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="skeleton h-4 w-24 mb-4" />
            <div className="skeleton h-8 w-32 mb-2" />
            <div className="skeleton h-3 w-20" />
        </div>
    )
}

export function SkeletonChart({ className = '', height = '300px' }) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="skeleton h-5 w-48 mb-6" />
            <div className="skeleton w-full" style={{ height }} />
        </div>
    )
}

export function SkeletonTable({ rows = 5, className = '' }) {
    return (
        <div className={`glass-card p-6 ${className}`}>
            <div className="skeleton h-5 w-48 mb-6" />
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 mb-3">
                    <div className="skeleton h-4 flex-1" />
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-4 w-32" />
                </div>
            ))}
        </div>
    )
}
