import { createFileRoute } from "@tanstack/react-router";
import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";
import { getAuthUserFromRequest } from "@/lib/api/get-auth-user";
import { PLAN_IDS, type PlanId } from "@/lib/pricing";
import { getRazorpayClient } from "@/lib/razorpay/client";
import { getRazorpayPlanId, razorpayConfigured } from "@/lib/razorpay/config";
import { ensureCustomerAndSubscription } from "@/lib/razorpay/webhooks";
import {
  applyPlanToSubscription,
  downgradeToFree,
  getSubscriptionByUserId,
} from "@/lib/subscriptions/service";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/subscriptions/change-plan")({
  server: {
    middleware: [requireSupabaseAuthRequest],
    handlers: {
      POST: async ({ request }) => {
        const auth = await getAuthUserFromRequest(request);
        if (!auth) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: { planId?: string; scheduleAtCycleEnd?: boolean };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const targetPlan = body.planId as PlanId;
        if (!targetPlan || !PLAN_IDS.includes(targetPlan)) {
          return Response.json({ error: "Invalid planId" }, { status: 400 });
        }

        const current = await getSubscriptionByUserId(auth.userId);
        if (!current) {
          return Response.json({ error: "Subscription not found" }, { status: 404 });
        }

        if (current.plan === targetPlan) {
          return Response.json({ success: true, plan: targetPlan, unchanged: true });
        }

        if (targetPlan === "free") {
          if (current.razorpay_subscription_id && razorpayConfigured()) {
            try {
              const razorpay = getRazorpayClient();
              await razorpay.subscriptions.cancel(current.razorpay_subscription_id, true);
            } catch (err) {
              console.error("[change-plan cancel]", err);
            }
            await supabaseAdmin
              .from("subscriptions")
              .update({ cancel_at_period_end: true, status: "canceled" })
              .eq("user_id", auth.userId);
            return Response.json({
              success: true,
              plan: current.plan,
              cancelAtPeriodEnd: true,
              message: "Subscription will end at the current billing period.",
            });
          }
          await downgradeToFree(auth.userId);
          return Response.json({ success: true, plan: "free" });
        }

        if (!razorpayConfigured()) {
          return Response.json({ error: "Payments are not configured" }, { status: 503 });
        }

        const newPlanId = getRazorpayPlanId(targetPlan);
        if (!newPlanId) {
          return Response.json({ error: "Plan not configured in Razorpay" }, { status: 503 });
        }

        if (
          current.razorpay_subscription_id &&
          (current.plan === "premium" || current.plan === "premium_plus")
        ) {
          const razorpay = getRazorpayClient();
          const scheduleAtCycleEnd = body.scheduleAtCycleEnd ?? false;
          try {
            await razorpay.subscriptions.update(current.razorpay_subscription_id, {
              plan_id: newPlanId,
              schedule_change_at: scheduleAtCycleEnd ? "cycle_end" : "now",
              customer_notify: 1,
            });
            if (!scheduleAtCycleEnd) {
              await applyPlanToSubscription({
                userId: auth.userId,
                plan: targetPlan,
                status: "active",
                cancelAtPeriodEnd: false,
              });
            } else {
              await supabaseAdmin
                .from("subscriptions")
                .update({ cancel_at_period_end: false })
                .eq("user_id", auth.userId);
            }
            return Response.json({
              success: true,
              plan: targetPlan,
              scheduled: scheduleAtCycleEnd,
            });
          } catch {
            /* fall through to new checkout */
          }
        }

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name, email")
          .eq("id", auth.userId)
          .maybeSingle();

        const email = profile?.email || auth.email;
        const razorpay = getRazorpayClient();
        const result = await ensureCustomerAndSubscription({
          userId: auth.userId,
          email,
          name: profile?.full_name ?? undefined,
          planId: targetPlan,
          razorpay,
        });

        if (result.downgraded) {
          return Response.json({ success: true, plan: "free" });
        }

        return Response.json({
          requiresCheckout: true,
          keyId: result.keyId,
          subscriptionId: result.subscriptionId,
          planId: targetPlan,
        });
      },
    },
  },
});
