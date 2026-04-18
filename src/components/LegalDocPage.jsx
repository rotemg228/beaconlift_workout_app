import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function LegalDocPage({ title, children, updated = 'April 18, 2026' }) {
  return (
    <div className="page-content no-topbar" style={{ paddingBottom: 32 }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex-col gap-20"
      >
        <header className="flex-col items-center text-center gap-12">
          <div className="brand-monogram" aria-label="BeaconLift logo">BL</div>
          <div>
            <h1 className="display-font text-3xl mb-8" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h1>
            <p className="text-xs text-muted">BeaconLift workout tracker</p>
          </div>
        </header>

        <div className="flex gap-12 justify-center" style={{ flexWrap: 'wrap', marginTop: -8 }}>
          <Link to="/pricing" className="text-xs text-accent font-semibold flex items-center gap-6" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Pricing
          </Link>
          <Link to="/privacy" className="text-xs text-muted font-semibold" style={{ textDecoration: 'none' }}>
            Privacy
          </Link>
          <Link to="/refunds" className="text-xs text-muted font-semibold" style={{ textDecoration: 'none' }}>
            Refunds
          </Link>
          <Link to="/terms" className="text-xs text-muted font-semibold" style={{ textDecoration: 'none' }}>
            Terms
          </Link>
          <Link to="/login" className="text-xs text-muted font-semibold" style={{ textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

        <article
          className="card w-full"
          style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            textAlign: 'left',
          }}
        >
          <div className="flex-col gap-16 text-sm" style={{ lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
            {children}
          </div>
        </article>

        <p className="text-xs text-muted text-center">Last updated: {updated}</p>
      </motion.div>
    </div>
  );
}
