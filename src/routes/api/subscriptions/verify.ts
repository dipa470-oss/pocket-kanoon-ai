import { createFileRoute } from "@tanstack/react-router";
import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";
import { getAuthUserFromRequest } from "@/lib/api/get-auth-user";
import type { PlanId } from "@/lib/pricing";
import { PLAN_PRICING } from "@/lib/pricing";
import { verifySubscriptionPaymentSignature } from "@/lib/razorpay/verify";
import {
  addMonths,
  applyPlanToSubscription,
  billingDescription,
  getSubscriptionByUserId,
  recordBillingPayment,
} from "@/lib/subscriptions/service";

export const Route = createFileRoute("/api/subscriptions/verify")({
  server: {
    middleware: [requireSupabaseAuthRequest],
    handlers: {
      POST: async ({ request }) => {
        const auth = await getAuthUserFromRequest(request);
        if (!auth) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: {
          razorpay_payment_id?: string;
          razorpay_subscription_id?: string;
          razorpay_signature?: string;
          planId?: string;
        };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planId } = body;
        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
          return Response.json({ error: "Missing payment verification fields" }, { status: 400 });
        }

        const valid = verifySubscriptionPaymentSignature({
          razorpay_payment_id,
          razorpay_subscription_id,
          razorpay_signature,
        });
        if (!valid) {
          return Response.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        const sub = await getSubscriptionByUserId(auth.userId);
        if (sub?.razorpay_subscription_id && sub.razorpay_subscription_id !== razorpay_subscription_id) {
          return Response.json({ error: "Subscription mismatch" }, { status: 400 });
        }

        const plan = (planId === "premium" || planId === "premium_plus" ? planId : sub?.plan) as PlanId;
        if (plan !== "premium" && plan !== "premium_plus") {
          return Response.json({ error: "Invalid plan" }, { status: 400 });
        }

        const periodEnd = addMonths(new Date(), 1);
        const updated = await applyPlanToSubscription({
          userId: auth.userId,
          plan,
          status: "active",
          razorpaySubscriptionId: razorpay_subscription_id,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        });

        await recordBillingPayment({
          userId: auth.userId,
          subscriptionId: updated.id,
          razorpayPaymentId: razorpay_payment_id,
          amountInr: PLAN_PRICING[plan].priceInr,
          status: "paid",
          plan,
          description: billingDescription(plan),
          paidAt: new Date(),
        });

        return Response.json({ success: true, subscription: updated });
      },
    },
  },
});
