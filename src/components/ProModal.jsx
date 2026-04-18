import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  Cloud,
  Infinity,
  BarChart3,
  Trophy,
  Sparkles,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { useUserStore } from '../store';
import { buildGumroadCheckoutUrl } from '../utils/gumroadCheckout';

const PRO_FEATURES = [
  {
    icon: Infinity,
    title: 'Unlimited routines',
    desc: 'Free caps custom programs at 3. Plus removes the ceiling—split days, specialties, whatever you run.',
    tag: 'vs 3 on Free',
  },
  {
    icon: Cloud,
    title: 'Backup & sync',
    desc: 'Templates and completed workouts stay tied to your account. Reinstall or switch phones without losing logs.',
    tag: 'Cloud',
  },
  {
    icon: BarChart3,
    title: 'Progress that earns the name',
    desc: 'Volume trends, muscle focus, and history so you see momentum—not just a list of past sessions.',
    tag: 'Analytics',
  },
  {
    icon: Trophy,
    title: 'PRs that stick',
    desc: 'Celebrate bests per lift and keep a clear record of what moved when you leveled up.',
    tag: 'PRs',
  },
  {
    icon: Sparkles,
    title: 'Plus on your profile',
    desc: 'Crown badge and verified Plus status—so your training identity matches the work you put in.',
    tag: 'Badge',
  },
  {
    icon: Smartphone,
    title: 'Built for your phone',
    desc: 'Tap-first layout, thumb reach, and PWA install—train on the floor, not at a desk.',
    tag: 'Mobile',
  },
];

export default function ProModal() {
  const { isProModalOpen, setProModalOpen, user, profile } = useUserStore();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isProModalOpen && profile.isPro) {
      setProModalOpen(false);
    }
  }, [isProModalOpen, profile.isPro, setProModalOpen]);

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
    setError('');
    setProModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div
        className="modal-overlay modal-center pro-modal-overlay animate-fadeIn"
        onClick={() => setProModalOpen(false)}
      >
        <motion.div
          className="modal-box pro-modal-box"
          onClick={e => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <div
            className="pro-modal-glow"
            aria-hidden
          />

          <button
            type="button"
            className="btn-icon pro-modal-close"
            onClick={() => setProModalOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex-col items-center text-center relative z-1 pro-modal-inner">
            <div className="icon-circle mb-12 pro-modal-hero-icon">
              <Crown size={30} />
            </div>

            <h2 className="display-font text-3xl mb-8">BeaconLift Plus</h2>
            <p className="text-muted text-sm mb-16">
              Serious training lives on your phone. Plus is for when you outgrow the basics.
            </p>

            <p className="section-title w-full text-left mb-12">What changes</p>
            <div className="pro-feature-grid">
              {PRO_FEATURES.map((feat, i) => (
                <div key={i} className="pro-feature-card">
                  <div className="pro-feature-card-top">
                    <div className="icon-circle pro-feature-icon">
                      <feat.icon size={18} />
                    </div>
                    <span className="badge badge-accent pro-feature-tag">{feat.tag}</span>
                  </div>
                  <div className="text-sm font-semibold text-left mb-8">{feat.title}</div>
                  <div className="text-xs text-muted leading-relaxed text-left">{feat.desc}</div>
                </div>
              ))}
            </div>

            <div className="card w-full mb-16 pro-card-pricing">
              <div className="flex items-center justify-between gap-12">
                <div className="text-left">
                  <div className="text-sm font-bold">Monthly · Gumroad</div>
                  <div className="text-xs text-muted mt-8">
                    7-day trial · then $1.99/mo (set in Gumroad)
                  </div>
                </div>
                <div className="text-lg font-bold text-accent shrink-0">$1.99</div>
              </div>
            </div>

            {canCheckout ? (
              <a
                href={checkoutHref}
                className="btn btn-primary btn-full pro-checkout-btn"
                style={{ textDecoration: 'none' }}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onCheckoutClick}
              >
                <ExternalLink size={18} />
                Open checkout in new tab
              </a>
            ) : (
              <button type="button" className="btn btn-primary btn-full pro-checkout-btn" disabled>
                <ExternalLink size={18} />
                Open checkout in new tab
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
            <p className="text-xs text-muted mt-16">
              After you pay, come back here—Plus turns on automatically (same email as your account helps). This tab stays on BeaconLift.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
