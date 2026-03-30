'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ALLOWED_EMAILS } from '@/lib/constants'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)

    // If already logged in, redirect to dashboard
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                const userEmail = session.user?.email?.toLowerCase()
                if (ALLOWED_EMAILS.includes(userEmail)) {
                    router.replace('/')
                    return
                }
                // Not in allowlist — sign out silently
                supabase.auth.signOut()
            }
            setCheckingSession(false)
        })
    }, [router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            })

            if (authError) {
                setError('Invalid email or password. Please try again.')
                setLoading(false)
                return
            }

            const userEmail = data.user?.email?.toLowerCase()
            if (!ALLOWED_EMAILS.includes(userEmail)) {
                await supabase.auth.signOut()
                setError('Access denied. Your account is not authorised to use this dashboard.')
                setLoading(false)
                return
            }

            router.replace('/')
        } catch {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    if (checkingSession) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        border: '3px solid var(--border-subtle)',
                        borderTopColor: 'var(--accent-teal)',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Ambient background glow */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '600px',
                height: '400px',
                background: 'radial-gradient(ellipse, rgba(0, 229, 204, 0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="glass-card animate-fade-in-up" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '48px 40px',
                position: 'relative',
            }}>
                {/* Logo + Brand */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 56, height: 56,
                        borderRadius: 16,
                        background: '#000',
                        margin: '0 auto 20px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 24px rgba(0, 229, 204, 0.12)',
                    }}>
                        <img src="/logo.png" alt="Ad-Lab" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1 style={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: 26,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: '0 0 6px',
                    }}>
                        Ad-Lab
                    </h1>
                    <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        letterSpacing: '0.1em',
                        color: 'var(--text-muted)',
                        margin: 0,
                        textTransform: 'uppercase',
                    }}>
                        Performance Intelligence Dashboard
                    </p>
                </div>

                {/* Sign-in form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            marginBottom: 8,
                        }}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@ad-lab.io"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 12,
                                color: 'var(--text-primary)',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-teal)'
                                e.target.style.boxShadow = '0 0 16px rgba(0, 229, 204, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-subtle)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            marginBottom: 8,
                        }}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 12,
                                color: 'var(--text-primary)',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-teal)'
                                e.target.style.boxShadow = '0 0 16px rgba(0, 229, 204, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-subtle)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            padding: '12px 14px',
                            background: 'rgba(255, 77, 109, 0.08)',
                            border: '1px solid rgba(255, 77, 109, 0.2)',
                            borderRadius: 10,
                            animation: 'fadeIn 0.3s ease-out',
                        }}>
                            <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                            <p style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 13,
                                color: 'var(--accent-coral)',
                                margin: 0,
                                lineHeight: 1.5,
                            }}>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        id="signin-button"
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading
                                ? 'var(--accent-teal-bg)'
                                : 'linear-gradient(135deg, var(--accent-teal) 0%, #00b4d8 100%)',
                            border: '1px solid var(--border-glow)',
                            borderRadius: 12,
                            color: loading ? 'var(--accent-teal)' : '#000',
                            fontFamily: 'Syne, sans-serif',
                            fontSize: 15,
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            marginTop: 4,
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-1px)'
                                e.target.style.boxShadow = '0 8px 24px rgba(0, 229, 204, 0.25)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = 'none'
                        }}
                    >
                        {loading ? (
                            <>
                                <div style={{
                                    width: 16, height: 16, borderRadius: '50%',
                                    border: '2px solid rgba(0, 229, 204, 0.3)',
                                    borderTopColor: 'var(--accent-teal)',
                                    animation: 'spin 0.7s linear infinite',
                                    flexShrink: 0,
                                }} />
                                Signing in…
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Footer note */}
                <p style={{
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    marginTop: 32,
                    marginBottom: 0,
                }}>
                    Access is restricted to authorised Ad-Lab team members.
                </p>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: var(--text-dim); }
      `}</style>
        </div>
    )
}
