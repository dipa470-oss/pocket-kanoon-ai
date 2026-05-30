export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function shortId(id: string) {
  return id.slice(0, 8);
}

import { planBillingLabel, PLAN_PRICING, type PlanId } from "@/lib/pricing";

export function planLabel(plan: string) {
  const entry = PLAN_PRICING[plan as PlanId];
  return entry?.name ?? "Free";
}

/** e.g. "Premium · ₹99/month" */
export function planLabelWithBilling(plan: string) {
  const name = planLabel(plan);
  const billing = planBillingLabel(plan);
  if (plan === "free") return `${name} (${billing})`;
  return `${name} · ${billing}`;
}
