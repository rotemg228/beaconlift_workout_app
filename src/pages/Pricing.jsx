import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Cloud,
  Star,
  TrendingUp,
  ShieldCheck,
  Dumbbell,
  History,
  LayoutList,
} from 'lucide-react';
import { useUserStore } from '../store';

const FREE_FEATURES = [
  { icon: Dumbbell, title: 'Log workouts', desc: 'Track sets, reps, weight, and rest timers.' },
  { icon: History, title: 'Session history', desc: 'Review past workouts and volume.' },
  { icon: LayoutList, title: 'Custom templates', desc: 'Up to 3 custom routines; full exercise library.' },
];

const PLUS_FEATURES = [
  { icon: Cloud, title: 'Cloud sync', desc: 'Access your workouts on any device.' },
  { icon: Star, title: 'Unlimited templates', desc: 'Create as many custom routines as you want.' },
  { icon: TrendingUp, title: 'Advanced analytics', desc: 'Volume trends and muscle split insights.' },
  { icon: ShieldCheck, title: 'Verified profile', desc: 'BeaconLift Plus badge on your profile.' },
];

export default function Pricing() {
  const user = useUserStore((s) => s.user);

  return (
    <div className="page-content no-topbar" style={{ paddingBottom: 32 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-col gap-24"
      >
        <header className="flex-col items-center text-center gap-12">
          <div className="brand-monogram" aria-label="BeaconLift logo">BL</div>
          <div>
            <h1 className="display-font text-3xl mb-8" style={{ color: 'var(--color-text-primary)' }}>
              BeaconLift pricing
            </h1>
            <p className="text-muted text-sm max-w-320" style={{ margin: '0 auto' }}>
              Strength training tracker with optional Plus membership. Prices shown in USD; taxes may apply at checkout.
            </p>
          </div>
        </header>

        <div className="flex-col gap-16">
          <section
            className="card w-full"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between mb-16">
              <div>
                <h2 className="text-lg font-bold">Free</h2>
                <p className="text-xs text-muted mt-4">Get started with the core app.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold display-font">$0</div>
                <div className="text-xs text-muted">forever</div>
              </div>
            </div>
            <ul className="flex-col gap-12">
              {FREE_FEATURES.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex gap-12 items-start">
                  <div
                    className="icon-circle shrink-0"
                    style={{ width: 32, height: 32, background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{title}</div>
                    <div className="text-xs text-muted leading-relaxed">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-20">
              {user ? (
                <Link to="/" className="btn btn-secondary btn-full" style={{ textDecoration: 'none' }}>
                  Open app
                </Link>
              ) : (
                <Link to="/login" className="btn btn-secondary btn-full" style={{ textDecoration: 'none' }}>
                  Get started free
                </Link>
              )}
            </div>
          </section>

          <section
            className="card w-full relative overflow-hidden"
            style={{
              border: '1px solid var(--color-accent)',
              background: 'var(--color-surface-2)',
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '120%',
                height: '45%',
                background: 'radial-gradient(ellipse at center, var(--color-accent-glow), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div className="relative z-1">
              <div className="flex items-start justify-between mb-16 gap-12">
                <div className="flex items-center gap-10">
                  <div className="icon-circle" style={{ background: 'var(--color-accent)', color: '#000', width: 44, height: 44 }}>
                    <Crown size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">BeaconLift Plus</h2>
                    <p className="text-xs text-muted mt-4">Membership billed monthly after trial.</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-accent display-font">$1.99</div>
                  <div className="text-xs text-muted">/ month</div>
                </div>
              </div>

              <p className="text-xs text-muted mb-16" style={{ lineHeight: 1.5 }}>
                <strong className="text-secondary">14-day free trial</strong>, then $1.99 USD per month. Cancel anytime subject to
                checkout terms. Payment is processed by our reseller (e.g. Paddle); your statement may show their name.
              </p>

              <ul className="flex-col gap-12 mb-20">
                {PLUS_FEATURES.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex gap-12 items-start">
                    <div
                      className="icon-circle shrink-0"
                      style={{ width: 32, height: 32, background: 'rgba(255,107,0,0.1)', color: 'var(--color-accent)' }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{title}</div>
                      <div className="text-xs text-muted leading-relaxed">{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {user ? (
                <Link to="/profile" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
                  Upgrade in app
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
                  Sign in to upgrade
                </Link>
              )}
            </div>
          </section>
        </div>

        <p className="text-xs text-muted text-center" style={{ lineHeight: 1.6 }}>
          BeaconLift is a workout tracking application. For billing support, use the receipt or customer portal from your payment
          provider.
        </p>
      </motion.div>
    </div>
  );
}
