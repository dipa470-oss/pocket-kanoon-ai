import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Loader2, Receipt, ArrowRight } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { PremiumBadge } from "@/components/PremiumBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { PLAN_IDS, PLAN_PRICING, type PlanId } from "@/lib/pricing";
import { planLabelWithBilling, formatDate } from "@/lib/admin/format";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [{ title: "Billing — Pocket Lawyer AI" }],
  }),
  component: () => (
    <RequireAuth>
      <BillingPage />
    </RequireAuth>
  ),
});

type BillingRow = {
  id: string;
  amount_inr: number;
  status: string;
  plan: string | null;
  description: string | null;
  paid_at: string | null;
  created_at: string;
};

function BillingPage() {
  const { user } = useAuth();
  const { subscription, loading, refresh, plan } = useSubscription();
  const { startCheckout, changePlan, busy } = useRazorpayCheckout(refresh);
  const [history, setHistory] = useState<BillingRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("billing_history")
      .select("id, amount_inr, status, plan, description, paid_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setHistory(data ?? []));
  }, [user, subscription?.updated_at]);

  const currentPlanIndex = PLAN_IDS.indexOf(plan as PlanId);

  return (
    <DashboardShell title="Billing & Subscription">
      <div className="space-y-8 max-w-3xl">
        <section className="rounded-xl border border-border/60 bg-card-elegant p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Current plan</h2>
            <PremiumBadge plan={plan} />
          </div>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                {planLabelWithBilling(plan)}
                {subscription?.status && (
                  <span className="ml-2 capitalize">· {subscription.status.replace("_", " ")}</span>
                )}
              </p>
              {subscription?.current_period_end && (
                <p className="text-xs text-muted-foreground mb-4">
                  {subscription.cancel_at_period_end ? "Access until" : "Renews"}{" "}
                  {formatDate(subscription.current_period_end)}
                </p>
              )}
              {subscription && subscription.consultation_credits > 0 && (
                <p className="text-sm mb-4">
                  Lawyer consultation credits:{" "}
                  <span className="text-primary font-medium">{subscription.consultation_credits}</span>
                </p>
              )}
            </>
          )}
        </section>

        <section className="rounded-xl border border-border/60 bg-card-elegant p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Change plan</h2>
          <div className="space-y-3">
            {PLAN_IDS.map((id, index) => {
              const p = PLAN_PRICING[id];
              const isCurrent = id === plan;
              const isUpgrade = index > currentPlanIndex;
              return (
                <div
                  key={id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border ${
                    isCurrent ? "border-primary/50 bg-primary/5" : "border-border/60"
                  }`}
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.billingLabel}</div>
                  </div>
                  {isCurrent ? (
                    <span className="text-xs text-primary font-medium">Current</span>
                  ) : (
                    <button
                      disabled={busy || loading}
                      onClick={() =>
                        id === "free"
                          ? changePlan("free")
                          : isUpgrade
                            ? startCheckout(id)
                            : changePlan(id, true)
                      }
                      className="text-sm px-4 py-2 rounded-md bg-secondary hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : id === "free" ? (
                        "Downgrade"
                      ) : isUpgrade ? (
                        "Upgrade"
                      ) : (
                        "Switch"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-border/60 bg-card-elegant p-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Billing history</h2>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {history.map((row) => (
                <li key={row.id} className="py-3 flex justify-between gap-4 text-sm">
                  <div>
                    <div className="font-medium">
                      {row.description ?? row.plan ?? "Payment"}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">{row.status}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-medium">₹{row.amount_inr}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(row.paid_at ?? row.created_at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link to="/" hash="pricing" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          Compare all features <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </DashboardShell>
  );
}
