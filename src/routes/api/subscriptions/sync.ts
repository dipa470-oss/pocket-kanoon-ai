import { createFileRoute } from "@tanstack/react-router";
import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";
import { getAuthUserFromRequest } from "@/lib/api/get-auth-user";
import { hasServiceRoleKey, isDevMode } from "@/lib/env";
import { syncExpiredSubscription } from "@/lib/subscriptions/service";

export const Route = createFileRoute("/api/subscriptions/sync")({
  server: {
    middleware: [requireSupabaseAuthRequest],
    handlers: {
      POST: async ({ request }) => {
        const auth = await getAuthUserFromRequest(request);
        if (!auth) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!hasServiceRoleKey()) {
          if (isDevMode()) {
            return Response.json({
              subscription: null,
              skipped: true,
              reason: "SUPABASE_SERVICE_ROLE_KEY not configured (development)",
            });
          }
          return Response.json(
            {
              error:
                "Subscription sync is not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.",
            },
            { status: 503 },
          );
        }

        try {
          const sub = await syncExpiredSubscription(auth.userId);
          return Response.json({ subscription: sub, skipped: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Subscription sync failed";
          console.error("[subscriptions/sync]", err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
