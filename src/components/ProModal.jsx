import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Cloud, Star, Zap, ShieldCheck, TrendingUp, CreditCard, Smartphone } from 'lucide-react';
import { useUserStore } from '../store';

const PRO_FEATURES = [
  { icon: Cloud,      title: 'Cloud Sync',         desc: 'Access your workouts on any device.' },
  { icon: Star,       title: 'Unlimited Templates', desc: 'Create as many custom routines as you want.' },
  { icon: TrendingUp, title: 'Advanced Analytics',  desc: 'Unlock volume trends and muscle split charts.' },
  { icon: ShieldCheck,title: 'Verified Profile',   desc: 'Get the exclusive BeaconLift Plus badge.' },
];

export default function ProModal() {
  const { isProModalOpen, setProModalOpen, user } = useUserStore();
  const isIOS = useMemo(() => /iPad|iPhone|iPod/.test(navigator.userAgent), []);
  const isAndroid = useMemo(() => /Android/.test(navigator.userAgent), []);
  const [loadingMethod, setLoadingMethod] = useState('');
  const [error, setError] = useState('');

  if (!isProModalOpen) return null;

  const handleSubscribe = async (method) => {
    if (loadingMethod) return;
    if (!user?.id || !user?.email) {
      setError('Please sign in with a real account before subscribing.');
      return;
    }
    setError('');
    setLoadingMethod(method);
    try {
      const idempotencyKey = `${user.id}:${method}:${new Date().toISOString().slice(0, 16)}`;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          paymentMethod: method,
          origin: window.location.origin,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || 'Failed to start checkout.');
      }
      window.location.href = payload.url;
    } catch (e) {
      setError(e.message || 'Checkout could not be started.');
      setLoadingMethod('');
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay animate-fadeIn" style={{ zIndex: 1000, alignItems: 'center' }} onClick={() => setProModalOpen(false)}>
        <motion.div
          className="modal-box relative overflow-hidden"
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          {/* ── Background Glow ── */}
          <div style={{
            position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '40%',
            background: 'radial-gradient(ellipse at center, var(--color-accent-glow), transparent 70%)',
            zIndex: 0, pointerEvents: 'none'
          }} />

          <button className="btn-icon" style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }} onClick={() => setProModalOpen(false)}>
            <X size={18} />
          </button>

          <div className="flex-col items-center text-center relative z-1">
            <div className="icon-circle mb-16" style={{ background: 'var(--color-accent)', color: '#000', width: 64, height: 64 }}>
              <Crown size={32} />
            </div>
            
            <h2 className="display-font text-3xl mb-4">BeaconLift Plus</h2>
            <p className="text-muted text-sm mb-24">Unlock the ultimate training experience.</p>

            <div className="flex-col gap-16 w-full text-left mb-32">
              {PRO_FEATURES.map((feat, i) => (
                <div key={i} className="flex gap-12 items-start">
                  <div className="icon-circle" style={{ width: 32, height: 32, background: 'rgba(255,107,0,0.1)', color: 'var(--color-accent)' }}>
                    <feat.icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{feat.title}</div>
                    <div className="text-xs text-muted leading-relaxed">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card w-full mb-24" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-accent)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">BeaconLift Plus Monthly</div>
                  <div className="text-xs text-muted">First 14 days free, then $1.99/mo</div>
                </div>
                <div className="text-lg font-bold text-accent">$1.99</div>
              </div>
            </div>

            <div className="flex-col gap-8 w-full">
              {isIOS && (
                <button className="btn btn-primary btn-full" onClick={() => handleSubscribe('apple')} disabled={!!loadingMethod}>
                  <Smartphone size={18} />
                  {loadingMethod === 'apple' ? 'Starting checkout...' : 'Subscribe with Apple Pay'}
                </button>
              )}
              {isAndroid && (
                <button className="btn btn-primary btn-full" onClick={() => handleSubscribe('google')} disabled={!!loadingMethod}>
                  <Smartphone size={18} />
                  {loadingMethod === 'google' ? 'Starting checkout...' : 'Subscribe with Google Pay'}
                </button>
              )}
              <button className="btn btn-secondary btn-full" onClick={() => handleSubscribe('card')} disabled={!!loadingMethod}>
                <CreditCard size={18} />
                {loadingMethod === 'card' ? 'Starting checkout...' : 'Subscribe with Card'}
              </button>
              <button className="btn btn-secondary btn-full" onClick={() => handleSubscribe('paypal')} disabled={!!loadingMethod}>
                <Zap size={18} />
                {loadingMethod === 'paypal' ? 'Starting checkout...' : 'Subscribe with PayPal'}
              </button>
            </div>
            {error && <p className="text-xs text-danger mt-12">{error}</p>}
            <p className="text-xs text-muted mt-12">Apple/Google Pay appear on supported devices and Stripe checkout settings.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
