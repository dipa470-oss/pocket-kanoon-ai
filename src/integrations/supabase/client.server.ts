// Server-side Supabase client with service role key - bypasses RLS.
// Use for trusted server routes only. Optional in local development.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  hasServiceRoleKey,
  isDevMode,
  warnOnce,
} from "@/lib/env";

function createSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error("Supabase admin client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

/** True when service role credentials are configured. */
export { hasServiceRoleKey };

/**
 * Service-role client, or null if SUPABASE_SERVICE_ROLE_KEY is missing.
 * Does not throw in development.
 */
export function getSupabaseAdmin(): ReturnType<typeof createSupabaseAdminClient> | null {
  if (!hasServiceRoleKey()) {
    if (isDevMode()) {
      warnOnce(
        "admin-disabled",
        "SUPABASE_SERVICE_ROLE_KEY not set — using anon client paths only; admin APIs will no-op or return 503.",
      );
    }
    return null;
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createSupabaseAdminClient();
  }
  return _supabaseAdmin;
}

/** Service-role client; throws if not configured (use in production payment/webhook paths). */
export function requireSupabaseAdmin(): ReturnType<typeof createSupabaseAdminClient> {
  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local for subscription sync, billing, and webhooks. See .env.local.example.",
    );
  }
  return client;
}

/**
 * @deprecated Prefer getSupabaseAdmin() or requireSupabaseAdmin().
 * Lazy proxy; throws on access when service role is missing (production-safe).
 */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    return Reflect.get(requireSupabaseAdmin(), prop, receiver);
  },
});
