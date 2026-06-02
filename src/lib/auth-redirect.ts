/** OAuth redirect URL — must match Supabase Dashboard → Authentication → URL Configuration. */
export function getAuthRedirectUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth`;
  }
  const siteUrl = import.meta.env.VITE_SITE_URL || process.env.VITE_SITE_URL;
  if (siteUrl) {
    return `${siteUrl.replace(/\/$/, "")}/auth`;
  }
  return "/auth";
}
