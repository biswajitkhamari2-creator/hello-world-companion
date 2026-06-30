import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://ffkyjnswyfeghmfmlapu.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vaeoI4DIfm2VoLkpLiGQUg_zd4IvuHh";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});