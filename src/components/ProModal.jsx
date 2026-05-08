import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  Cloud,
  Infinity,
  BarChart3,
  Trophy,
  Sparkles,
  Smartphone,
  CreditCard,
} from 'lucide-react';
import { useUserStore } from '../store';
import { isNativeRuntime, presentPlusPaywall } from '../revenuecat';
import { isWebBillingConfigured, presentWebPlusPaywall, ErrorCode } from '../revenuecatWeb';

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

/** Only mounted while paywall is open — keeps hook order trivially stable */
function ProModalContent() {
  const { setProModalOpen, user, profile } = useUserStore();
  const [error, setError] = useState('');
  const [isOpeningPaywall, setIsOpeningPaywall] = useState(false);
  const paywallHostRef = useRef(null);

  const isNative = isNativeRuntime();
  const webBillingReady = isWebBillingConfigured();
  const canSubscribe = !!(user?.id && user?.email) && (isNative || webBillingReady);

  useEffect(() => {
    if (profile.isPro) {
      setProModalOpen(false);
    }
  }, [profile.isPro, setProModalOpen]);

  const onOpenNativePaywall = async () => {
    try {
      setError('');
      setIsOpeningPaywall(true);
      await presentPlusPaywall();
      setProModalOpen(false);
    } catch (err) {
      setError(err?.message || 'Could not open native paywall. Please try again.');
    } finally {
      setIsOpeningPaywall(false);
    }
  };

  const onOpenWebPaywall = async () => {
    if (!user?.id || !user?.email) {
      setError('Please sign in before subscribing.');
      return;
    }
    try {
      setError('');
      setIsOpeningPaywall(true);
      await presentWebPlusPaywall({
        userId: user.id,
        customerEmail: user.email,
        htmlTarget: paywallHostRef.current,
      });
      setProModalOpen(false);
    } catch (err) {
      if (err?.errorCode === ErrorCode.UserCancelledError) {
        setError('');
        return;
      }
      setError(err?.message || 'Checkout could not be opened. Please try again.');
    } finally {
      setIsOpeningPaywall(false);
    }
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
          <div className="pro-modal-glow" aria-hidden />

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
                  <div className="text-sm font-bold">BeaconLift Plus</div>
                  <div className="text-xs text-muted mt-8">
                    Pricing, trial, and renewal are set in RevenueCat (same entitlement on web and in the app).
                  </div>
                </div>
                <CreditCard size={22} className="text-accent shrink-0" aria-hidden />
              </div>
            </div>

            {/* Mount point for embedded paywall UI (optional); RC may still use a full-screen layer */}
            <div ref={paywallHostRef} className="w-full" style={{ minHeight: 0 }} />

            {isNative ? (
              <button
                type="button"
                className="btn btn-primary btn-full pro-checkout-btn"
                onClick={onOpenNativePaywall}
                disabled={isOpeningPaywall}
              >
                <CreditCard size={18} />
                {isOpeningPaywall ? 'Opening paywall...' : 'Subscribe'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-full pro-checkout-btn"
                onClick={onOpenWebPaywall}
                disabled={!canSubscribe || isOpeningPaywall}
              >
                <CreditCard size={18} />
                {isOpeningPaywall ? 'Opening checkout...' : 'Subscribe'}
              </button>
            )}

            {error && (
              <p className="text-xs text-danger mt-12" style={{ maxWidth: 280 }}>
                {error}
              </p>
            )}
            {!isNative && !webBillingReady && (
              <p className="text-xs text-danger mt-12" style={{ maxWidth: 320 }}>
                Web checkout is not configured. Add{' '}
                <code style={{ fontSize: '0.7rem' }}>VITE_REVENUECAT_WEB_BILLING_API_KEY</code> (RevenueCat Web Billing public key) and redeploy.
              </p>
            )}
            <p className="text-xs text-muted mt-16">
              {isNative
                ? 'Billed through Apple or Google. Plus unlocks when the purchase completes.'
                : 'Secure checkout powered by RevenueCat (payments processed via Stripe). Use the same account as in the app so your subscription carries across devices.'}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function ProModal() {
  const isProModalOpen = useUserStore(s => s.isProModalOpen);
  if (!isProModalOpen) return null;
  return <ProModalContent />;
}
