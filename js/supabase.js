import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

// Returns null when credentials are not configured — app falls back to
// localStorage-only mode (no auth prompt, full offline).
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
