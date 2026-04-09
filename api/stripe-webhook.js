import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function updatePlan(userId, isPlus) {
  if (!supabaseUrl || !supabaseServiceRole || !userId) return;
  const supabase = createClient(supabaseUrl, supabaseServiceRole);
  await supabase.from('profiles').upsert({
    id: userId,
    plan: isPlus ? 'plus' : 'free',
    is_plus: isPlus,
    is_pro: isPlus,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  if (!stripeSecretKey || !stripeWebhookSecret) return res.status(500).send('Stripe env missing');

  const stripe = new Stripe(stripeSecretKey);

  try {
    const signature = req.headers['stripe-signature'];
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session?.metadata?.user_id || session?.subscription_details?.metadata?.user_id;
      await updatePlan(userId, true);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const userId = subscription?.metadata?.user_id;
      await updatePlan(userId, false);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
