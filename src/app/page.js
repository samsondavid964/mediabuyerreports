'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import TabBar from '@/components/TabBar'
import SummaryTab from '@/components/tabs/SummaryTab'
import PerformanceTab from '@/components/tabs/PerformanceTab'
import HeatmapTab from '@/components/tabs/HeatmapTab'
import RiskTab from '@/components/tabs/RiskTab'
import ClientDeepDiveTab from '@/components/tabs/ClientDeepDiveTab'
import TechIssuesTab from '@/components/tabs/TechIssuesTab'
import AllDataTab from '@/components/tabs/AllDataTab'

function getDefaultDates() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export default function DashboardPage() {
  const defaults = getDefaultDates()
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [activeTab, setActiveTab] = useState('summary')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: sbError } = await supabase
        .from('daily_logs')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (sbError) throw sbError
      setLogs(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load data from Supabase.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const tabProps = { logs, loading, dateRange: { start: startDate, end: endDate } }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Header
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="px-6 py-6 max-w-screen-2xl mx-auto">
        {/* Error State */}
        {error && !loading && (
          <div className="glass-card p-8 mb-6 text-center animate-fade-in">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent-coral)' }}>
              Failed to Load Data
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button
              onClick={fetchLogs}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: 'var(--accent-teal-bg)',
                border: '1px solid var(--border-glow)',
                color: 'var(--accent-teal)',
                fontFamily: 'Syne, sans-serif',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* No data notice (non-error) */}
        {!loading && !error && logs.length === 0 && (
          <div className="glass-card p-8 mb-6 text-center animate-fade-in">
            <div className="text-3xl mb-3">📭</div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
              No logs found
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No daily logs exist for the selected date range ({startDate} → {endDate}). Try widening the range.
            </p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'summary' && <SummaryTab {...tabProps} />}
        {activeTab === 'performance' && <PerformanceTab {...tabProps} />}
        {activeTab === 'heatmap' && <HeatmapTab {...tabProps} />}
        {activeTab === 'risk' && <RiskTab {...tabProps} />}
        {activeTab === 'clientdeepdive' && <ClientDeepDiveTab {...tabProps} />}
        {activeTab === 'techissues' && <TechIssuesTab {...tabProps} />}
        {activeTab === 'alldata' && <AllDataTab {...tabProps} />}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 mt-8 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
        <p style={{ color: 'var(--footer-color)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
          AD-LAB PERFORMANCE INTELLIGENCE • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
