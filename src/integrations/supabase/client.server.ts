import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./client";

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.APP_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);