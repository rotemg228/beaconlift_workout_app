import LegalDocPage from '../components/LegalDocPage';

export default function RefundPolicy() {
  return (
    <LegalDocPage title="Refund policy">
      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Overview</h2>
        <p>
          BeaconLift offers optional paid plans (for example <strong className="text-secondary">BeaconLift Plus</strong>). Paid
          subscriptions are processed by our payment partner, which may act as the <strong className="text-secondary">merchant of
          record</strong> (for example <strong className="text-secondary">Paddle</strong>). That means Paddle (or the checkout
          provider shown on your receipt) is typically the seller of record for tax and consumer-rights purposes.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Trials &amp; billing</h2>
        <p>
          If we offer a free trial, it will be described at checkout. After the trial, your payment method may be charged on the
          billing interval shown (for example monthly) until you cancel. Exact terms appear on the checkout page and in the
          confirmation email from the payment provider.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Cancellations</h2>
        <p>
          You can cancel a subscription through the customer portal or account management link provided by the payment provider in
          your receipt or confirmation email. Canceling stops future renewals; it does not always refund past charges unless required
          by law or the policy below.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Refunds</h2>
        <p>
          <strong className="text-secondary">Refund requests for paid subscriptions are handled by our payment provider (e.g.
          Paddle)</strong> according to their buyer terms and applicable law. If you believe you were charged in error, contact
          support using the link on your receipt or Paddle’s support channels. We will also try to help if you email us, but the
          payment provider may need to process any money movement.
        </p>
        <p className="mt-12">
          We do not guarantee refunds for partial subscription periods except where required by law or where the payment provider
          approves a refund under its policies.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Statutory rights</h2>
        <p>
          Nothing in this policy limits mandatory consumer rights in your country (for example withdrawal or cooling-off rules
          where they apply to digital services). If those rights apply, the payment provider’s checkout and documentation should
          describe how to exercise them.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Free tier</h2>
        <p>The free version of BeaconLift does not require payment; this refund policy applies to paid plans only.</p>
      </section>

      <section>
        <h2 className="text-base font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Contact</h2>
        <p>
          App or account questions:{' '}
          <a href="mailto:forgeesupport@proton.me?subject=BeaconLift%20Billing%20%2F%20Refund" className="text-accent font-semibold" style={{ textDecoration: 'none' }}>
            forgeesupport@proton.me
          </a>
        </p>
        <p className="mt-12 text-xs text-muted">
          This page is provided for clarity and is not legal advice. For Paddle-specific terms, refer to Paddle’s documentation and
          the terms presented at checkout.
        </p>
      </section>
    </LegalDocPage>
  );
}
