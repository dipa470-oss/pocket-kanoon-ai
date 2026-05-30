import { createFileRoute } from "@tanstack/react-router";
import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";
import { getAuthUserFromRequest } from "@/lib/api/get-auth-user";
import { PLAN_IDS, type PlanId } from "@/lib/pricing";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { getRazorpayKeyId, razorpayConfigured } from "@/lib/razorpay/config";
import { ensureCustomerAndSubscription } from "@/lib/razorpay/webhooks";
import { downgradeToFree } from "@/lib/subscriptions/service";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/subscriptions/checkout")({
  server: {
    middleware: [requireSupabaseAuthRequest],
    handlers: {
      POST: async ({ request }) => {
        const auth = await getAuthUserFromRequest(request);
        if (!auth) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: { planId?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const planId = body.planId as PlanId;
        if (!planId || !PLAN_IDS.includes(planId)) {
          return Response.json({ error: "Invalid planId" }, { status: 400 });
        }

        if (planId === "free") {
          await downgradeToFree(auth.userId);
          return Response.json({ success: true, plan: "free" });
        }

        if (!razorpayConfigured()) {
          return Response.json(
            { error: "Payments are not configured. Contact support." },
            { status: 503 },
          );
        }

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name, email")
          .eq("id", auth.userId)
          .maybeSingle();

        const email = profile?.email || auth.email;
        if (!email) {
          return Response.json({ error: "Email required for billing" }, { status: 400 });
        }

        try {
          const razorpay = getRazorpayClient();
          const result = await ensureCustomerAndSubscription({
            userId: auth.userId,
            email,
            name: profile?.full_name ?? undefined,
            planId,
            razorpay,
          });

          if (result.downgraded) {
            return Response.json({ success: true, plan: "free" });
          }

          return Response.json({
            keyId: getRazorpayKeyId(),
            subscriptionId: result.subscriptionId,
            planId: result.planId,
          });
        } catch (err) {
          console.error("[checkout]", err);
          const message = err instanceof Error ? err.message : "Checkout failed";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
