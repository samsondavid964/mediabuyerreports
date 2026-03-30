export const signalConfig = {
    'Performing Well': { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: 'Performing Well', score: 100 },
    'Mixed/Watching': { color: '#f5c842', bg: 'rgba(245,200,66,0.1)', label: 'Mixed/Watching', score: 60 },
    'Underperforming': { color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)', label: 'Underperforming', score: 25 },
    'At Risk/Possible Churn': { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', label: 'At Risk/Churn', score: 0 },
}

export const signalOrder = [
    'Performing Well',
    'Mixed/Watching',
    'Underperforming',
    'At Risk/Possible Churn',
]

export function getHealthScore(logs) {
    if (!logs.length) return null
    const total = logs.reduce(
        (sum, log) => sum + (signalConfig[log.performance_signal]?.score ?? 50),
        0
    )
    return Math.round(total / logs.length)
}

import { SUBSTANTIVE_MIN_LENGTH } from './constants'

export function isSubstantive(text) {
    if (!text) return false
    const t = text.trim().toLowerCase().replace(/[.,!?;:]/g, '')
    if (t.length < SUBSTANTIVE_MIN_LENGTH) return false
    const ignoreWords = [
        'none', 'na', 'n/a', 'no', 'nothing', 'all good',
        'no issues', 'none at the moment', 'not applicable',
        'none today', 'no current issues', 'all set',
        'no problems', 'no new issues', 'no issues so far'
    ]
    return !ignoreWords.includes(t)
}
