import type { PlanId } from "@/lib/pricing";
import { PLAN_PRICING } from "@/lib/pricing";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  addMonths,
  applyPlanToSubscription,
  billingDescription,
  downgradeToFree,
  getSubscriptionByUserId,
  recordBillingPayment,
} from "@/lib/subscriptions/service";

type RazorpayEntity = Record<string, unknown>;

type WebhookPayload = {
  event?: string;
  payload?: {
    subscription?: { entity?: RazorpayEntity };
    payment?: { entity?: RazorpayEntity };
  };
};

function planFromNotes(notes: unknown): PlanId | null {
  if (!notes || typeof notes !== "object") return null;
  const plan = (notes as { plan?: string }).plan;
  if (plan === "premium" || plan === "premium_plus" || plan === "free") return plan;
  return null;
}

async function findUserByRazorpaySubscriptionId(razorpaySubId: string) {
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("razorpay_subscription_id", razorpaySubId)
    .maybeSingle();
  return data;
}

function periodEndFromEntity(entity: RazorpayEntity): Date | null {
  const end = entity.current_end;
  if (typeof end === "number") return new Date(end * 1000);
  return addMonths(new Date(), 1);
}

export async function storeWebhookEvent(eventId: string, eventType: string, payload: unknown) {
  await supabaseAdmin.from("razorpay_webhook_events").upsert(
    {
      event_id: eventId,
      event_type: eventType,
      payload: payload as Record<string, unknown>,
    },
    { onConflict: "event_id" },
  );
}

export async function markWebhookProcessed(eventId: string, errorMessage?: string) {
  await supabaseAdmin
    .from("razorpay_webhook_events")
    .update({
      processed_at: new Date().toISOString(),
      error_message: errorMessage ?? null,
    })
    .eq("event_id", eventId);
}

export async function processRazorpayWebhook(body: WebhookPayload, eventId: string) {
  const event = body.event ?? "";
  const subEntity = body.payload?.subscription?.entity;
  const payEntity = body.payload?.payment?.entity;

  if (subEntity && typeof subEntity.id === "string") {
    const existing = await findUserByRazorpaySubscriptionId(subEntity.id);
    const notesPlan = planFromNotes(subEntity.notes);
    const userId =
      typeof subEntity.notes === "object" && subEntity.notes && "user_id" in (subEntity.notes as object)
        ? String((subEntity.notes as { user_id: string }).user_id)
        : existing?.user_id;

    if (!userId) return;

    const plan =
      notesPlan ??
      (existing?.plan as PlanId | undefined) ??
      (subEntity.plan_id ? "premium" : "free");

    if (
      event === "subscription.activated" ||
      event === "subscription.charged" ||
      event === "subscription.updated"
    ) {
      const planId = (plan === "premium" || plan === "premium_plus" ? plan : "premium") as PlanId;
      await applyPlanToSubscription({
        userId,
        plan: planId,
        status: "active",
        razorpaySubscriptionId: String(subEntity.id),
        razorpayCustomerId:
          typeof subEntity.customer_id === "string" ? subEntity.customer_id : existing?.razorpay_customer_id,
        currentPeriodEnd: periodEndFromEntity(subEntity),
        cancelAtPeriodEnd: false,
      });

      if (event === "subscription.charged" && payEntity) {
        const amount =
          typeof payEntity.amount === "number" ? Math.round(payEntity.amount / 100) : PLAN_PRICING[planId].priceInr;
        await recordBillingPayment({
          userId,
          subscriptionId: existing?.id,
          razorpayPaymentId: typeof payEntity.id === "string" ? payEntity.id : null,
          amountInr: amount,
          status: "paid",
          plan: planId,
          description: billingDescription(planId),
          paidAt: new Date(),
        });
      }
    }

    if (event === "subscription.cancelled" || event === "subscription.completed") {
      await applyPlanToSubscription({
        userId,
        plan: "free",
        status: "canceled",
        razorpaySubscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }

    if (event === "subscription.halted" || event === "subscription.pending") {
      await applyPlanToSubscription({
        userId,
        plan: (existing?.plan as PlanId) ?? "premium",
        status: "past_due",
        razorpaySubscriptionId: String(subEntity.id),
        currentPeriodEnd: periodEndFromEntity(subEntity),
      });
    }
  }

  if (payEntity && event === "payment.failed") {
    const subId = typeof payEntity.subscription_id === "string" ? payEntity.subscription_id : null;
    const sub = subId ? await findUserByRazorpaySubscriptionId(subId) : null;
    if (sub) {
      await applyPlanToSubscription({
        userId: sub.user_id,
        plan: sub.plan as PlanId,
        status: "past_due",
      });
      const amount =
        typeof payEntity.amount === "number"
          ? Math.round(payEntity.amount / 100)
          : PLAN_PRICING[sub.plan as PlanId]?.priceInr ?? 0;
      await recordBillingPayment({
        userId: sub.user_id,
        subscriptionId: sub.id,
        razorpayPaymentId: typeof payEntity.id === "string" ? payEntity.id : null,
        amountInr: amount,
        status: "failed",
        plan: sub.plan as PlanId,
        description: "Payment failed",
      });
    }
  }
}

export async function ensureCustomerAndSubscription(params: {
  userId: string;
  email: string;
  name?: string;
  planId: PlanId;
  razorpay: import("razorpay").default;
}) {
  const { userId, email, name, planId, razorpay } = params;
  if (planId === "free") {
    await downgradeToFree(userId);
    return { downgraded: true as const };
  }

  const sub = await getSubscriptionByUserId(userId);
  let customerId = sub?.razorpay_customer_id ?? null;

  if (!customerId) {
    const customer = await razorpay.customers.create({
      name: name || email.split("@")[0],
      email,
      notes: { user_id: userId },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from("subscriptions")
      .update({ razorpay_customer_id: customerId })
      .eq("user_id", userId);
  }

  const { getRazorpayPlanId } = await import("./config");
  const plan_id = getRazorpayPlanId(planId);
  if (!plan_id) {
    throw new Error(`Razorpay plan not configured for ${planId}. Set RAZORPAY_PLAN_${planId.toUpperCase()}.`);
  }

  if (sub?.razorpay_subscription_id && sub.plan !== planId) {
    try {
      await razorpay.subscriptions.cancel(sub.razorpay_subscription_id, false);
    } catch {
      /* may already be cancelled */
    }
  }

  const rzSub = await razorpay.subscriptions.create({
    plan_id,
    customer_id: customerId,
    total_count: 120,
    customer_notify: 1,
    notes: { user_id: userId, plan: planId },
  });

  await supabaseAdmin
    .from("subscriptions")
    .update({
      razorpay_customer_id: customerId,
      razorpay_subscription_id: rzSub.id,
      status: "trialing",
      cancel_at_period_end: false,
    })
    .eq("user_id", userId);

  return {
    downgraded: false as const,
    subscriptionId: rzSub.id,
    keyId: (await import("./config")).getRazorpayKeyId(),
    planId,
  };
}
