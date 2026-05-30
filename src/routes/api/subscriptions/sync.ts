import { createFileRoute } from "@tanstack/react-router";
import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";
import { getAuthUserFromRequest } from "@/lib/api/get-auth-user";
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

        const sub = await syncExpiredSubscription(auth.userId);
        return Response.json({ subscription: sub });
      },
    },
  },
});
