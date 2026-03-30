import { supabase } from './supabase'

/**
 * Fetch daily logs within a date range.
 * Returns { data, error } — caller decides how to handle errors.
 */
export async function fetchDailyLogs(startDate, endDate) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Fetch all GMC issue resolutions.
 */
export async function fetchGmcIssues() {
  const { data, error } = await supabase
    .from('gmc_issues')
    .select('*')
    .order('resolved_at', { ascending: false })

  if (error) {
    // Table doesn't exist yet — return empty gracefully
    if (error.code === '42P01') return []
    throw error
  }
  return data || []
}

/**
 * Mark a GMC issue as resolved.
 */
export async function resolveGmcIssue(clientName, reportedAt) {
  const { error } = await supabase
    .from('gmc_issues')
    .insert([{
      client_name: clientName,
      status: 'resolved',
      reported_at: reportedAt,
      resolved_at: new Date().toISOString(),
    }])

  if (error) {
    if (error.code === '42P01') {
      throw new Error("The 'gmc_issues' Supabase table does not exist. Please create it first.")
    }
    throw error
  }
}
