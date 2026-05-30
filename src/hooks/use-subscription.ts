import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { PlanId } from "@/lib/pricing";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: PlanId;
  status: string;
  consultation_credits: number;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  razorpay_subscription_id: string | null;
  updated_at: string;
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await authenticatedFetch("/api/subscriptions/sync", { method: "POST" });
    } catch {
      /* sync is best-effort */
    }
    const { data } = await supabase
      .from("subscriptions")
      .select(
        "id, user_id, plan, status, consultation_credits, current_period_end, cancel_at_period_end, razorpay_subscription_id, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setSubscription({
        ...data,
        plan: data.plan as PlanId,
        cancel_at_period_end: data.cancel_at_period_end ?? false,
      });
    } else {
      setSubscription(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { subscription, loading, refresh, plan: subscription?.plan ?? "free" };
}
