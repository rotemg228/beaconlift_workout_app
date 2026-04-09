import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Chrome, Apple, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (authError) throw authError;
        setUser(data.user);
        navigate('/');
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.fullName }
          }
        });
        if (authError) throw authError;
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-content flex-center" style={{ minHeight: '100vh', padding: 20 }}>
      {/* ── Background Glow ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at 50% 30%, rgba(255,107,0,0.08), transparent 70%)',
        zIndex: -1
      }} />

      <motion.div 
        className="w-full" style={{ maxWidth: 400 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex-col items-center mb-32">
          <div className="logo-text text-4xl mb-8">BeaconLift</div>
          <p className="text-muted text-sm tracking-widest uppercase">The Future of Training</p>
        </div>

        <div className="card p-24 relative overflow-hidden">
          {success ? (
            <motion.div 
              className="flex-col items-center text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            >
              <div className="icon-circle mb-16" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 className="mb-8 font-bold">Check your email</h2>
              <p className="text-sm text-muted mb-24">We've sent a verification link to<br/><strong>{form.email}</strong></p>
              <button className="btn btn-ghost btn-sm" onClick={() => setSuccess(false)}>
                Back to Login
              </button>
            </motion.div>
          ) : (
            <>
              <div className="flex gap-16 mb-24 p-4" style={{ background: 'var(--color-surface-2)', borderRadius: 12 }}>
                <button 
                  className={`flex-1 py-8 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-surface shadow-lg text-accent' : 'text-muted'}`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
                <button 
                  className={`flex-1 py-8 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-surface shadow-lg text-accent' : 'text-muted'}`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleAuth} className="flex-col gap-16">
                {!isLogin && (
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-12 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <input 
                        type="text" className="input pr-12 pl-40" placeholder="John Doe" required
                        value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-12 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="email" className="input pr-12 pl-40" placeholder="name@example.com" required
                      value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-12 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="password" className="input pr-12 pl-40" placeholder="••••••••" required
                      value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-8 p-12 rounded-lg text-xs" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full py-14 mt-8" disabled={loading}>
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="divider my-24">OR CONTINUE WITH</div>

              <div className="flex gap-12">
                <button className="btn btn-ghost flex-1 gap-8 py-12" onClick={() => handleSocialAuth('google')}>
                  <Chrome size={18} />
                  <span className="text-xs font-bold">Google</span>
                </button>
                <button className="btn btn-ghost flex-1 gap-8 py-12" onClick={() => handleSocialAuth('apple')}>
                  <Apple size={18} />
                  <span className="text-xs font-bold">Apple</span>
                </button>
              </div>
            </>
          )}
        </div>

        <button 
          className="btn btn-ghost btn-sm mt-24 gap-8 mx-auto"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={16} />
          Back to App
        </button>
      </motion.div>
    </div>
  );
}
