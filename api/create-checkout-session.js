import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured.' });
  }

  try {
    const stripe = new Stripe(stripeSecretKey);
    const { userId, email, paymentMethod, origin } = req.body || {};
    if (!userId || !email || !origin) {
      return res.status(400).json({ error: 'Missing required checkout payload.' });
    }

    const idempotencyKey = req.headers['x-idempotency-key'] || `${userId}:${paymentMethod || 'card'}`;
    const selectedMethod = paymentMethod === 'paypal' ? ['paypal', 'card'] : ['card'];

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        customer_email: email,
        payment_method_types: selectedMethod,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: 199,
              recurring: { interval: 'month' },
              product_data: {
                name: 'BeaconLift Plus',
                description: 'Plus plan with cloud sync and advanced analytics',
              },
            },
          },
        ],
        subscription_data: {
          trial_period_days: 14,
          metadata: { user_id: userId, plan: 'plus' },
        },
        metadata: { user_id: userId, plan: 'plus', payment_method: paymentMethod || 'card' },
        success_url: `${origin}/profile?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/profile?checkout=cancelled`,
      },
      { idempotencyKey }
    );

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Checkout creation failed.' });
  }
}
