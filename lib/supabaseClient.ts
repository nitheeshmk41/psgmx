// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// **Named export**
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);
