import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ChevronRight, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../supabase'
import { getAuthRedirectUrl } from '../authRedirect'
import { useUserStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function Login({ onFinish }) {
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [successEmail, setSuccessEmail] = useState('')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const { setUser } = useUserStore()
  const navigate = useNavigate()

  const handleSocialLogin = async (provider) => {
    try {
      setError('')
      setLoading(true)
      const redirectTo = getAuthRedirectUrl()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || undefined,
        },
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setSuccessEmail('')

      if (isSignup) {
        const username = form.username.trim()
        if (!username) throw new Error('Username is required.')
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: getAuthRedirectUrl() || undefined,
            data: { username },
          },
        })
        if (error) throw error
        if (data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            plan: 'free',
            is_pro: false,
            full_name: username,
          })
        }
        setSuccessEmail(form.email.trim())
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        })
        if (error) throw error
        if (!data?.user?.email_confirmed_at) {
          await supabase.auth.signOut()
          throw new Error('Please verify your email before signing in.')
        }
        setUser(data.user)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    onFinish?.()
    navigate('/')
  }

  return (
    <div className="login-page container py-40 flex-col items-center justify-center min-h-screen text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-col items-center gap-16 mb-40"
      >
        <div className="logo-container mb-12">
          <div className="brand-monogram" aria-label="BeaconLift logo">BL</div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to BeaconLift</h1>
        <p className="text-muted max-w-280">
          Sync your workouts to the cloud and unlock premium features across all your devices.
        </p>
      </motion.div>

      <div className="flex-col gap-12 w-full max-w-320">
        <div className="tabs" style={{ marginBottom: 4 }}>
          <button className={`tab${!isSignup ? ' active' : ''}`} onClick={() => { setIsSignup(false); setError(''); setSuccessEmail('') }}>
            Sign In
          </button>
          <button className={`tab${isSignup ? ' active' : ''}`} onClick={() => { setIsSignup(true); setError(''); setSuccessEmail('') }}>
            Sign Up
          </button>
        </div>

        {successEmail ? (
          <div className="card" style={{ border: '1px solid rgba(34,197,94,0.35)' }}>
            <div className="flex items-center gap-8 mb-6" style={{ color: '#22c55e' }}>
              <CheckCircle2 size={16} />
              <span className="font-bold">Verify your email</span>
            </div>
            <p className="text-sm">
              We sent a verification link to <strong>{successEmail}</strong>. Please verify, then sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="flex-col gap-10">
            {isSignup && (
              <div className="input-group">
                <label className="input-label">Username</label>
                <div className="relative">
                  <User className="search-icon" size={16} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: 38 }}
                    placeholder="your_username"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="relative">
                <Mail className="search-icon" size={16} />
                <input
                  type="email"
                  className="input"
                  style={{ paddingLeft: 38 }}
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock className="search-icon" size={16} />
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: 38 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="card card-sm" style={{ borderColor: 'rgba(239,68,68,0.35)', color: '#ef4444' }}>
                <div className="flex items-center gap-8 text-sm">
                  <AlertCircle size={14} />
                  {error}
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full py-16" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In with Email')}
            </button>
          </form>
        )}

        <button
          className="btn btn-full gap-12 py-16"
          style={{ background: '#fff', color: '#000' }}
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
        >
          <Globe size={20} />
          <span className="font-bold">Continue with Google</span>
        </button>

        <div className="flex items-center gap-12 my-12 opacity-30">
          <div style={{ flex: 1, height: 1, background: 'var(--color-text)' }} />
          <span className="text-xs uppercase font-bold">OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-text)' }} />
        </div>

        <button
          className="btn btn-ghost btn-full gap-8 py-16 text-muted"
          onClick={handleGuest}
          disabled={loading}
        >
          Continue as Guest
          <ChevronRight size={16} />
        </button>
      </div>

      <p className="text-xs text-muted mt-40 max-w-240 leading-relaxed">
        By continuing, you agree to our <span className="text-accent underline">Terms of Service</span> and <span className="text-accent underline">Privacy Policy</span>.
      </p>
    </div>
  )
}
