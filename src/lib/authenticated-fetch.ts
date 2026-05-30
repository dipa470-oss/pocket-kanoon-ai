import { supabase } from "@/integrations/supabase/client";

/**
 * fetch() with the current Supabase session bearer token (same pattern as attachSupabaseAuth).
 */
export async function authenticatedFetch(input: string, init?: RequestInit): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("You must be signed in to use this feature.");
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
