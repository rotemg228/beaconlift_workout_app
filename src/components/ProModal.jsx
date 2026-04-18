import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Cloud, Star, ShieldCheck, TrendingUp, ExternalLink } from 'lucide-react';
import { useUserStore } from '../store';
import { buildGumroadCheckoutUrl } from '../utils/gumroadCheckout';

const PRO_FEATURES = [
  { icon: Cloud,      title: 'Cloud Sync',         desc: 'Access your workouts on any device.' },
  { icon: Star,       title: 'Unlimited Templates', desc: 'Create as many custom routines as you want.' },
  { icon: TrendingUp, title: 'Advanced Analytics',  desc: 'Unlock volume trends and muscle split charts.' },
  { icon: ShieldCheck,title: 'Verified Profile',   desc: 'Get the exclusive BeaconLift Plus badge.' },
];

export default function ProModal() {
  const { isProModalOpen, setProModalOpen, user } = useUserStore();
  const [error, setError] = useState('');

  if (!isProModalOpen) return null;

  const gumroadBase = import.meta.env.VITE_GUMROAD_CHECKOUT_URL?.trim();

  const checkoutHref = useMemo(
    () =>
      buildGumroadCheckoutUrl(gumroadBase, {
        userId: user?.id,
        email: user?.email,
      }),
    [gumroadBase, user?.id, user?.email]
  );

  const canCheckout = !!(user?.id && user?.email && checkoutHref);

  const onCheckoutClick = (e) => {
    if (!user?.id || !user?.email) {
      e.preventDefault();
      setError('Please sign in with a real account before subscribing.');
      return;
    }
    if (!gumroadBase) {
      e.preventDefault();
      setError('Checkout is not configured. Add VITE_GUMROAD_CHECKOUT_URL in Vercel and redeploy.');
      return;
    }
    if (!checkoutHref) {
      e.preventDefault();
      setError('Invalid checkout URL. Use a full https://…gumroad.com/l/… link in VITE_GUMROAD_CHECKOUT_URL.');
      return;
    }
  };

  return (
    <AnimatePresence>
      <div
        className="modal-overlay animate-fadeIn"
        style={{ zIndex: 1000, alignItems: 'center' }}
        onClick={() => setProModalOpen(false)}
      >
        <motion.div
          className="modal-box relative overflow-hidden"
          onClick={e => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
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
                  <div className="text-xs text-muted">7-day trial on Gumroad · then $1.99/mo (set in Gumroad)</div>
                </div>
                <div className="text-lg font-bold text-accent">$1.99</div>
              </div>
            </div>

            {canCheckout ? (
              <a
                href={checkoutHref}
                className="btn btn-primary btn-full"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={onCheckoutClick}
              >
                <ExternalLink size={18} />
                Continue to checkout
              </a>
            ) : (
              <button type="button" className="btn btn-primary btn-full" disabled>
                <ExternalLink size={18} />
                Continue to checkout
              </button>
            )}

            {error && (
              <p className="text-xs text-danger mt-12" style={{ maxWidth: 280 }}>
                {error}
              </p>
            )}
            {!gumroadBase && (
              <p className="text-xs text-danger mt-12" style={{ maxWidth: 280 }}>
                Missing <code style={{ fontSize: '0.7rem' }}>VITE_GUMROAD_CHECKOUT_URL</code> on this deploy. Add it in Vercel → Environment Variables → Redeploy.
              </p>
            )}
            <p className="text-xs text-muted mt-12">
              Secure checkout and receipts are handled by Gumroad. Use the same email as your BeaconLift account if possible.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
