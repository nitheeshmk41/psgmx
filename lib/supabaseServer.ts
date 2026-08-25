import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !publicKey) {
  console.warn("Supabase environment variables are not fully configured for server client.");
}

function requireSupabaseConfig() {
  if (!supabaseUrl || !publicKey) {
    throw new Error("Supabase environment variables are missing.");
  }
}

export function createSupabaseServerClient() {
  requireSupabaseConfig();
  return createClient(supabaseUrl || "", serviceRoleKey || publicKey || "");
}

export function createSupabasePublicServerClient() {
  requireSupabaseConfig();
  return createClient(supabaseUrl || "", publicKey || "");
}
