import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jpmnecaxaxbtstiyjwbl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbW5lY2F4YXhidHN0aXlqd2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM2MTcsImV4cCI6MjA2ODE4OTYxN30.LTwPt7tW6fqmDf3fBSh3-guOBvpWgS4BlgtX5zP2q-A';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SUPABASE] Missing environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

// Log the actual URL being used (for debugging)
console.log('[SUPABASE] Client initialized with URL:', supabaseUrl);
console.log('[SUPABASE] Environment check:', {
  hasEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasEnvKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  actualUrl: supabaseUrl
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 