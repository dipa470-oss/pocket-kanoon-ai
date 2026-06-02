import type { PlanId } from "@/lib/pricing";

import { PLAN_PRICING } from "@/lib/pricing";

import { getSupabaseAdmin, requireSupabaseAdmin } from "@/integrations/supabase/client.server";

import { hasServiceRoleKey, isDevMode } from "@/lib/env";



export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";



export function consultationCreditsForPlan(plan: PlanId): number {

  if (plan === "premium_plus") return 4;

  return 0;

}



export function addMonths(date: Date, months: number): Date {

  const d = new Date(date);

  d.setMonth(d.getMonth() + months);

  return d;

}



/** Whether server-side subscription writes are available. */

export function isSubscriptionAdminAvailable(): boolean {

  return hasServiceRoleKey();

}



function requireAdmin() {

  return requireSupabaseAdmin();

}



export async function getSubscriptionByUserId(userId: string) {

  const admin = getSupabaseAdmin();

  if (!admin) return null;



  const { data, error } = await admin

    .from("subscriptions")

    .select("*")

    .eq("user_id", userId)

    .maybeSingle();

  if (error) throw error;

  return data;

}



export async function applyPlanToSubscription(params: {

  userId: string;

  plan: PlanId;

  status?: SubscriptionStatus;

  razorpayCustomerId?: string | null;

  razorpaySubscriptionId?: string | null;

  currentPeriodEnd?: Date | null;

  cancelAtPeriodEnd?: boolean;

}) {

  const admin = requireAdmin();

  const credits = consultationCreditsForPlan(params.plan);

  const patch: Record<string, unknown> = {

    plan: params.plan,

    status: params.status ?? "active",

    consultation_credits: credits,

    cancel_at_period_end: params.cancelAtPeriodEnd ?? false,

    updated_at: new Date().toISOString(),

  };

  if (params.razorpayCustomerId !== undefined) {

    patch.razorpay_customer_id = params.razorpayCustomerId;

  }

  if (params.razorpaySubscriptionId !== undefined) {

    patch.razorpay_subscription_id = params.razorpaySubscriptionId;

  }

  if (params.currentPeriodEnd !== undefined) {

    patch.current_period_end = params.currentPeriodEnd?.toISOString() ?? null;

  }



  const { data, error } = await admin

    .from("subscriptions")

    .update(patch)

    .eq("user_id", params.userId)

    .select()

    .single();

  if (error) throw error;

  return data;

}



export async function downgradeToFree(userId: string) {

  return applyPlanToSubscription({

    userId,

    plan: "free",

    status: "active",

    razorpaySubscriptionId: null,

    currentPeriodEnd: null,

    cancelAtPeriodEnd: false,

  });

}



/**

 * Downgrade if period ended. Skips silently in development when SERVICE_ROLE_KEY is unset.

 */

export async function syncExpiredSubscription(userId: string) {

  if (!hasServiceRoleKey()) {

    if (isDevMode()) return null;

    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for subscription sync.");

  }



  const sub = await getSubscriptionByUserId(userId);

  if (!sub) return null;



  const now = Date.now();

  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;

  const expired =

    periodEnd !== null &&

    periodEnd < now &&

    (sub.status === "canceled" || sub.status === "past_due" || sub.cancel_at_period_end);



  if (expired && sub.plan !== "free") {

    return downgradeToFree(userId);

  }

  return sub;

}



export async function recordBillingPayment(params: {

  userId: string;

  subscriptionId?: string | null;

  razorpayPaymentId?: string | null;

  razorpayInvoiceId?: string | null;

  amountInr: number;

  status: "paid" | "failed" | "refunded" | "pending";

  plan?: PlanId;

  description?: string;

  paidAt?: Date;

}) {

  const admin = requireAdmin();

  const row = {

    user_id: params.userId,

    subscription_id: params.subscriptionId ?? null,

    razorpay_payment_id: params.razorpayPaymentId ?? null,

    razorpay_invoice_id: params.razorpayInvoiceId ?? null,

    amount_inr: params.amountInr,

    status: params.status,

    plan: params.plan ?? null,

    description: params.description ?? null,

    paid_at: params.paidAt?.toISOString() ?? null,

  };



  if (params.razorpayPaymentId) {

    const { error } = await admin

      .from("billing_history")

      .upsert(row, { onConflict: "razorpay_payment_id" });

    if (error) throw error;

  } else {

    const { error } = await admin.from("billing_history").insert(row);

    if (error) throw error;

  }

}



export function billingDescription(plan: PlanId): string {

  return `${PLAN_PRICING[plan].name} — ${PLAN_PRICING[plan].billingLabel}`;

}


