import querystring from 'node:querystring';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET;
const expectedProductId = process.env.GUMROAD_PRODUCT_ID || '';

function parseFormBody(req) {
  if (typeof req.body === 'string') return querystring.parse(req.body);
  if (Buffer.isBuffer(req.body)) return querystring.parse(req.body.toString('utf8'));
  if (req.body && typeof req.body === 'object') return req.body;
  return {};
}

function pickUserId(fields) {
  let id =
    fields.beaconlift_user_id ||
    fields['beaconlift_user_id'] ||
    fields['custom_fields[beaconlift_user_id]'];
  if (!id && fields.custom_fields) {
    try {
      const cf = JSON.parse(fields.custom_fields);
      id = cf.beaconlift_user_id;
    } catch {
      /* ignore */
    }
  }
  return id && String(id).trim() ? String(id).trim() : null;
}

async function findUserIdByEmail(supabase, email) {
  if (!email || !supabase) return null;
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 1000;
  for (let i = 0; i < 20; i++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;
    const found = data.users.find((u) => (u.email || '').toLowerCase() === normalized);
    if (found?.id) return found.id;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

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
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const secret = req.query?.secret || req.query?.token;
  if (!webhookSecret || secret !== webhookSecret) {
    return res.status(401).send('Unauthorized');
  }

  if (!supabaseUrl || !supabaseServiceRole) {
    return res.status(500).send('Supabase env missing');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRole);
  const fields = parseFormBody(req);

  if (expectedProductId && fields.product_id && fields.product_id !== expectedProductId) {
    return res.status(400).send('Unknown product');
  }

  let userId = pickUserId(fields);
  if (!userId && fields.email) {
    userId = await findUserIdByEmail(supabase, fields.email);
  }

  if (!userId) {
    return res.status(400).send('Missing user link (beaconlift_user_id or account email)');
  }

  const downgrade =
    fields.refunded === 'true' ||
    fields.partially_refunded === 'true' ||
    !!fields.subscription_cancelled_at ||
    !!fields.subscription_ended_at;

  const upgrade = !!(fields.sale_id || fields.order_number || fields.license_id);

  if (downgrade) {
    await updatePlan(userId, false);
    return res.status(200).send('ok');
  }

  if (upgrade) {
    await updatePlan(userId, true);
    return res.status(200).send('ok');
  }

  return res.status(200).send('noop');
}
