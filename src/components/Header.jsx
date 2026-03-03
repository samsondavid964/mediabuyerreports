'use client'

export default function Header({ startDate, endDate, onStartDateChange, onEndDateChange }) {
    return (
        <header className="sticky top-0 z-50 glass-card border-b px-6 py-4 flex items-center justify-between"
            style={{ borderRadius: 0, borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(24px)' }}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ background: '#000' }}>
                    <img src="/logo.png" alt="Ad-Lab" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: '#f1f5f9' }}>
                        Ad-Lab
                    </h1>
                    <p className="text-xs tracking-wider" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                        PERFORMANCE INTELLIGENCE DASHBOARD
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <label className="text-xs" style={{ color: '#64748b' }}>FROM</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                />
                <label className="text-xs" style={{ color: '#64748b' }}>TO</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                />
            </div>
        </header>
    )
}
