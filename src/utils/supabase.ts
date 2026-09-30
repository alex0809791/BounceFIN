import { createClient } from '@supabase/supabase-js';

// Supabase configuration provided by user
export const SUPABASE_URL = 'https://bvmorujgusbgvivusynm.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bW9ydWpndXNiZ3ZpdnVzeW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NTk4NjUsImV4cCI6MjEwNjIzNTg2NX0.7Wm7agpIf4TAyje2EIylunYUitwAnxTKkAlPSzY3RsM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const TRIAL_DAYS = 35;
export const APP_DOMAIN = 'https://bouncefin.com.br';
