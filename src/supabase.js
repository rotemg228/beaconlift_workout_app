import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Prevent crashing if the variables are missing or placeholders
const isValid = supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_')

if (!isValid) {
  console.warn('Supabase URL or Key is missing. Cloud sync will be disabled. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = isValid 
  ? createClient(supabaseUrl, supabaseKey)
  : {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured') }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase is not configured') }),
        signInWithOAuth: async () => ({ data: null, error: new Error('Supabase is not configured') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
          }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
        upsert: async () => ({ data: null, error: null }),
        update: () => ({ eq: () => ({ eq: async () => ({ data: null, error: null }) }) }),
        delete: () => ({ eq: () => ({ eq: async () => ({ data: null, error: null }) }) }),
      }),
    };
