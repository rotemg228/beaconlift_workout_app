import { Link } from 'react-router-dom';
import LegalDocPage from '../components/LegalDocPage';

export default function TermsOfService() {
  return (
    <LegalDocPage title="Terms of service">
      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Agreement</h2>
        <p>
          These Terms of Service (“Terms”) govern your use of BeaconLift’s website, mobile web experience, and related services
          (collectively, the “Service”). By creating an account, signing in, or using the Service, you agree to these Terms. If you
          do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>The Service</h2>
        <p>
          BeaconLift provides tools to log and review strength-training workouts. We may update, limit, or discontinue features
          with reasonable notice where practicable. We do not guarantee uninterrupted availability or that the Service will be
          error-free.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Accounts</h2>
        <p>
          You must provide accurate registration information and keep your credentials secure. You are responsible for activity
          under your account. You must be old enough to enter a binding contract in your region (and at least 13, or the age
          required where you live). We may suspend or terminate accounts that violate these Terms or create risk for others.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="flex-col gap-8 mt-8" style={{ paddingLeft: 18, listStyle: 'disc' }}>
          <li>Use the Service unlawfully or to harass, abuse, or harm others</li>
          <li>Attempt to probe, scan, or test the vulnerability of our systems without authorization</li>
          <li>Reverse engineer, scrape, or overload the Service in a way that impairs it for others</li>
          <li>Misrepresent your identity or affiliation</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Subscriptions &amp; payments</h2>
        <p>
          Paid plans (such as BeaconLift Plus) may be offered through a third-party checkout provider that acts as merchant of
          record (for example Gumroad). Fees, taxes, renewal terms, and cancellation are presented at purchase and in your receipt.
          See our{' '}
          <Link to="/refunds" className="text-accent font-semibold" style={{ textDecoration: 'none' }}>
            Refund policy
          </Link>{' '}
          for refunds and charge disputes handled via the payment provider.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Health &amp; fitness disclaimer</h2>
        <p>
          The Service is for informational and tracking purposes only. It is <strong className="text-secondary">not</strong> medical
          advice. Consult a qualified professional before starting or changing an exercise program. You assume all risk from physical
          activity you perform based on information you enter or derive from the Service.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Intellectual property</h2>
        <p>
          The Service, branding, and content we provide are owned by us or our licensors. We grant you a limited, non-exclusive,
          non-transferable license to use the Service for personal, non-commercial purposes in line with these Terms.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Disclaimer of warranties</h2>
        <p>
          The Service is provided <strong className="text-secondary">“as is”</strong> and <strong className="text-secondary">“as
          available”</strong>. To the fullest extent permitted by law, we disclaim implied warranties of merchantability, fitness for
          a particular purpose, and non-infringement.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, we and our suppliers will not be liable for indirect, incidental, special,
          consequential, or punitive damages, or for loss of profits, data, or goodwill. Our aggregate liability for claims
          arising out of the Service will not exceed the greater of (a) amounts you paid us in the twelve months before the claim
          or (b) fifty US dollars (USD $50), except where liability cannot be limited under applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Indemnity</h2>
        <p>
          You will defend and indemnify us against claims arising from your misuse of the Service, your content, or your violation
          of these Terms, to the extent permitted by law.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Governing law</h2>
        <p>
          These Terms are governed by the laws applicable in your primary place of business or residence as we may specify in a
          future update, without regard to conflict-of-law rules. Mandatory consumer protections in your country still apply where
          they cannot be waived.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Changes</h2>
        <p>
          We may modify these Terms by posting an updated version and changing the “Last updated” date. Continued use after changes
          become effective constitutes acceptance of the revised Terms for non-material updates where allowed by law.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Contact</h2>
        <p>
          Questions about these Terms:{' '}
          <a href="mailto:forgeesupport@proton.me?subject=BeaconLift%20Terms" className="text-accent font-semibold" style={{ textDecoration: 'none' }}>
            forgeesupport@proton.me
          </a>
        </p>
        <p className="mt-12 text-xs text-muted">
          This document is for general information and is not legal advice. Have counsel review if you need jurisdiction-specific
          terms.
        </p>
      </section>
    </LegalDocPage>
  );
}
