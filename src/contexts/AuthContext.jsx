'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ALLOWED_EMAILS = [
    'tinus@ad-lab.io',
    'stephan@ad-lab.io',
    'jenelle@ad-lab.io',
    'edafe@ad-lab.io',
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const handleSession = async (newSession) => {
        if (!newSession) {
            setSession(null)
            setUser(null)
            return
        }

        const email = newSession.user?.email?.toLowerCase()
        if (!ALLOWED_EMAILS.includes(email)) {
            // Email not in allowlist — sign them out immediately
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
            return
        }

        setSession(newSession)
        setUser(newSession.user)
    }

    useEffect(() => {
        // Restore any existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session).finally(() => setLoading(false))
        })

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session)
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}

export { ALLOWED_EMAILS }
