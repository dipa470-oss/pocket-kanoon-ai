import type { PlanId } from "@/lib/pricing";

export function getRazorpayKeyId(): string | undefined {
  return process.env.RAZORPAY_KEY_ID ?? process.env.VITE_RAZORPAY_KEY_ID;
}

export function getRazorpayKeySecret(): string | undefined {
  return process.env.RAZORPAY_KEY_SECRET;
}

export function getRazorpayWebhookSecret(): string | undefined {
  return process.env.RAZORPAY_WEBHOOK_SECRET;
}

/** Razorpay Dashboard plan IDs — set in production env. */
export function getRazorpayPlanId(planId: PlanId): string | undefined {
  if (planId === "premium") return process.env.RAZORPAY_PLAN_PREMIUM;
  if (planId === "premium_plus") return process.env.RAZORPAY_PLAN_PREMIUM_PLUS;
  return undefined;
}

export function razorpayConfigured(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}
