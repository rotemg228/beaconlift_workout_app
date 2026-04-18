import LegalDocPage from '../components/LegalDocPage';

export default function PrivacyPolicy() {
  return (
    <LegalDocPage title="Privacy policy">
      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Who we are</h2>
        <p>
          BeaconLift (“we”, “us”) is a workout tracking application. This policy describes how we handle information when you use
          our website and app (the “Service”).
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>What we collect</h2>
        <ul className="flex-col gap-8" style={{ paddingLeft: 18, listStyle: 'disc' }}>
          <li>
            <strong className="text-secondary">Account data:</strong> email address, display name or username, and authentication
            details when you create an account (including via Google or other providers we enable).
          </li>
          <li>
            <strong className="text-secondary">Fitness data you enter:</strong> workouts, exercises, sets, templates, measurements,
            and related notes you save in the Service.
          </li>
          <li>
            <strong className="text-secondary">Technical data:</strong> basic device/browser information, approximate usage, and
            diagnostics needed to run and secure the Service (for example through our hosting or analytics providers).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>How we use data</h2>
        <p>We use the information above to:</p>
        <ul className="flex-col gap-8 mt-8" style={{ paddingLeft: 18, listStyle: 'disc' }}>
          <li>Provide, sync, and back up your account and workout data</li>
          <li>Authenticate you and protect against abuse</li>
          <li>Process subscriptions and payments where applicable (see our refund policy for checkout)</li>
          <li>Improve reliability and fix bugs</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Storage &amp; processors</h2>
        <p>
          We use trusted third-party infrastructure to run the Service, including database and authentication providers (such as
          Supabase) and hosting (such as Vercel). Payment processing for paid plans may be handled by a reseller / merchant of record
          (such as Paddle) under their terms and privacy notice.
        </p>
        <p className="mt-12">
          Data may be processed in countries where those providers operate. We rely on contractual and technical safeguards
          appropriate to the services we use.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Cookies &amp; local storage</h2>
        <p>
          We use cookies and similar technologies (including browser local storage) needed for sign-in, preferences, and app
          functionality. You can clear site data in your browser settings, which may sign you out or reset local preferences.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Retention</h2>
        <p>
          We keep your information while your account is active and for a reasonable period afterward for backups, legal compliance,
          or dispute resolution, unless a shorter period is required by law.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Your choices</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, export, or delete personal data. Contact us at the
          email below and we will respond within a reasonable time. You may also delete your account through in-app options where
          available, or ask us to delete associated data.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Children</h2>
        <p>The Service is not directed at children under 13 (or the minimum age required in your region). We do not knowingly collect their personal data.</p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Contact</h2>
        <p>
          Questions about this policy:{' '}
          <a href="mailto:forgeesupport@proton.me?subject=BeaconLift%20Privacy" className="text-accent font-semibold" style={{ textDecoration: 'none' }}>
            forgeesupport@proton.me
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Changes</h2>
        <p>We may update this policy from time to time. The “Last updated” date at the bottom of this page will change when we do.</p>
      </section>
    </LegalDocPage>
  );
}
