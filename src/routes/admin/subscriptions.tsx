import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, planLabel, shortId } from "@/lib/admin/format";
import { PLAN_IDS, PLAN_PRICING, planBillingLabel, type PlanId } from "@/lib/pricing";
import { consultationCreditsForPlan } from "@/lib/subscriptions/service";

type SubRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  consultation_credits: number;
  current_period_end: string | null;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
  profile?: { full_name: string | null; email: string | null } | null;
};

const STATUSES = ["active", "canceled", "past_due", "trialing"] as const;

export const Route = createFileRoute("/admin/subscriptions")({
  component: AdminSubscriptionsPage,
});

function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [webhookCount, setWebhookCount] = useState(0);
  const [recentPayments, setRecentPayments] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [subsRes, webhooksRes, paymentsRes] = await Promise.all([
      supabase.from("subscriptions").select("*").order("updated_at", { ascending: false }),
      supabase.from("razorpay_webhook_events").select("id", { count: "exact", head: true }),
      supabase
        .from("billing_history")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);
    const { data: subs, error } = subsRes;
    setWebhookCount(webhooksRes.count ?? 0);
    setRecentPayments(paymentsRes.count ?? 0);
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const userIds = (subs ?? []).map((s) => s.user_id);
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
      : { data: [] as { id: string; full_name: string | null; email: string | null }[] };
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    setRows(
      (subs ?? []).map((s) => ({
        ...s,
        profile: profileMap.get(s.user_id) ?? null,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: string, patch: Partial<SubRow>) => {
    setBusyId(id);
    const { error } = await supabase.from("subscriptions").update(patch).eq("id", id);
    setBusyId(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Subscription updated");
      load();
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-8">
        <AdminPageHeader
          title="Subscriptions"
          description="Manage plans and billing: Free (₹0/month), Premium (₹99/month), Premium Plus (₹499/month)."
        />
        <button onClick={load} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        {PLAN_IDS.map((id) => (
          <div key={id} className="rounded-lg border border-border/60 bg-card-elegant px-4 py-3 text-sm">
            <span className="font-medium">{PLAN_PRICING[id].name}</span>
            <span className="text-muted-foreground ml-2">{PLAN_PRICING[id].billingLabel}</span>
            <span className="block text-xs text-muted-foreground mt-1">
              Active: {rows.filter((r) => r.plan === id && r.status === "active").length}
            </span>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6 text-sm">
        <div className="rounded-lg border border-border/60 bg-card-elegant px-4 py-3">
          <span className="text-muted-foreground">Paid invoices (30d)</span>
          <span className="block font-display text-2xl font-semibold">{recentPayments}</span>
        </div>
        <div className="rounded-lg border border-border/60 bg-card-elegant px-4 py-3">
          <span className="text-muted-foreground">Webhook events logged</span>
          <span className="block font-display text-2xl font-semibold">{webhookCount}</span>
        </div>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card-elegant overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Razorpay</TableHead>
                <TableHead>Period end</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.profile?.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.profile?.email ?? shortId(r.user_id)}</div>
                  </TableCell>
                  <TableCell>
                    <select
                      disabled={busyId === r.id}
                      value={r.plan}
                      className="text-xs bg-background border border-border rounded px-2 py-1"
                      onChange={(e) => {
                        const plan = e.target.value as PlanId;
                        update(r.id, {
                          plan,
                          consultation_credits: consultationCreditsForPlan(plan),
                        });
                      }}
                    >
                      {PLAN_IDS.map((p) => (
                        <option key={p} value={p}>
                          {planLabel(p)}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {planBillingLabel(r.plan)}
                  </TableCell>
                  <TableCell>
                    <select
                      disabled={busyId === r.id}
                      value={r.status}
                      className="text-xs bg-background border border-border rounded px-2 py-1"
                      onChange={(e) => update(r.id, { status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      min={0}
                      disabled={busyId === r.id}
                      defaultValue={r.consultation_credits}
                      className="w-16 text-xs bg-background border border-border rounded px-2 py-1"
                      onBlur={(e) => {
                        const n = parseInt(e.target.value, 10);
                        if (!Number.isNaN(n) && n !== r.consultation_credits) {
                          update(r.id, { consultation_credits: n });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[140px]">
                    <div className="truncate" title={r.razorpay_subscription_id ?? undefined}>
                      {r.razorpay_subscription_id ? shortId(r.razorpay_subscription_id) : "—"}
                    </div>
                    {r.cancel_at_period_end && (
                      <span className="text-amber-600 dark:text-amber-400">Cancels at period end</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {r.current_period_end ? formatDate(r.current_period_end) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {formatDate(r.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
