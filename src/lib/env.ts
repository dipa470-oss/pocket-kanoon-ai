/**
 * Central Supabase / app environment helpers.
 * SERVICE_ROLE_KEY is optional in local development.
 */

const warned = new Set<string>();

export function isDevMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    import.meta.env?.DEV === true ||
    import.meta.env?.MODE === "development"
  );
}

export function getSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function hasPublicSupabaseEnv(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function hasServiceRoleKey(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

export function warnOnce(key: string, message: string): void {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[env] ${message}`);
}

/** Client / SSR: URL + anon key are required. */
export function validatePublicSupabaseEnv(context = "app"): void {
  const missing: string[] = [];
  if (!getSupabaseUrl()) {
    missing.push("SUPABASE_URL or VITE_SUPABASE_URL");
  }
  if (!getSupabaseAnonKey()) {
    missing.push("SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY");
  }
  if (missing.length === 0) return;

  const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Copy .env.local.example to .env.local and fill in values from your Supabase project.`;
  console.error(`[Supabase:${context}] ${message}`);
  throw new Error(message);
}

export type ServerEnvValidation = {
  ok: boolean;
  missing: string[];
  warnings: string[];
};

/** Server boot: validate public vars; service role is optional in development. */
export function validateServerEnv(): ServerEnvValidation {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!getSupabaseUrl()) missing.push("SUPABASE_URL");
  if (!getSupabaseAnonKey()) missing.push("SUPABASE_PUBLISHABLE_KEY");

  if (!hasServiceRoleKey()) {
    const msg =
      "SUPABASE_SERVICE_ROLE_KEY is not set — subscription sync, Razorpay webhooks, and server-side billing writes are disabled.";
    if (isDevMode()) {
      warnings.push(msg);
      warnOnce("service-role-dev", `${msg} (development mode — this is OK for local UI work.)`);
    } else {
      warnings.push(msg);
      warnOnce("service-role-prod", `${msg} (production requires this key.)`);
    }
  }

  if (missing.length > 0) {
    const message = `Missing required Supabase environment variable(s): ${missing.join(", ")}`;
    console.error(`[env] ${message}`);
  }

  return { ok: missing.length === 0, missing, warnings };
}

export function logServerEnvOnBoot(): void {
  if (typeof process === "undefined") return;
  validateServerEnv();
}
