/** Single source of truth for plan pricing (INR, monthly unless noted). */
export type PlanId = "free" | "premium" | "premium_plus";

export const PLAN_IDS = ["free", "premium", "premium_plus"] as const satisfies readonly PlanId[];

export type PlanPricing = {
  id: PlanId;
  name: string;
  priceInr: number;
  priceDisplay: string;
  period: string;
  billingLabel: string;
};

export const PLAN_PRICING: Record<PlanId, PlanPricing> = {
  free: {
    id: "free",
    name: "Free",
    priceInr: 0,
    priceDisplay: "₹0",
    period: "forever",
    billingLabel: "₹0/month",
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceInr: 99,
    priceDisplay: "₹99",
    period: "per month",
    billingLabel: "₹99/month",
  },
  premium_plus: {
    id: "premium_plus",
    name: "Premium Plus",
    priceInr: 499,
    priceDisplay: "₹499",
    period: "per month",
    billingLabel: "₹499/month",
  },
};

export function planBillingLabel(planId: string): string {
  const plan = PLAN_PRICING[planId as PlanId];
  return plan?.billingLabel ?? "—";
}

export function isPaidPlan(planId: string): boolean {
  return planId === "premium" || planId === "premium_plus";
}
