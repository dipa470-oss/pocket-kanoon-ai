import { useState } from "react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { openSubscriptionCheckout } from "@/lib/razorpay/checkout-script";
import type { PlanId } from "@/lib/pricing";
import { useAuth } from "@/hooks/use-auth";

export function useRazorpayCheckout(onComplete?: () => void) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const startCheckout = async (planId: PlanId) => {
    if (planId === "free") {
      setBusy(true);
      try {
        const res = await authenticatedFetch("/api/subscriptions/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: "free" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to switch plan");
        toast.success(json.message ?? "You are now on the Free plan.");
        onComplete?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Plan change failed");
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    try {
      const res = await authenticatedFetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");

      if (!json.subscriptionId || !json.keyId) {
        throw new Error("Invalid checkout response");
      }

      await openSubscriptionCheckout({
        keyId: json.keyId,
        subscriptionId: json.subscriptionId,
        planId,
        userEmail: user?.email,
        userName: user?.user_metadata?.full_name as string | undefined,
        onSuccess: async (response) => {
          const verifyRes = await authenticatedFetch("/api/subscriptions/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              planId,
            }),
          });
          const verifyJson = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyJson.error || "Payment verification failed");
          toast.success("Subscription activated!");
          onComplete?.();
        },
        onDismiss: () => {
          toast.message("Checkout cancelled");
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message !== "Checkout closed") {
        toast.error(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const changePlan = async (planId: PlanId, scheduleAtCycleEnd = false) => {
    setBusy(true);
    try {
      const res = await authenticatedFetch("/api/subscriptions/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, scheduleAtCycleEnd }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Plan change failed");

      if (json.requiresCheckout && json.subscriptionId && json.keyId) {
        await openSubscriptionCheckout({
          keyId: json.keyId,
          subscriptionId: json.subscriptionId,
          planId,
          userEmail: user?.email,
          onSuccess: async (response) => {
            const verifyRes = await authenticatedFetch("/api/subscriptions/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, planId }),
            });
            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyJson.error || "Verification failed");
            toast.success("Plan updated!");
            onComplete?.();
          },
        });
      } else {
        toast.success(json.message ?? "Plan updated.");
        onComplete?.();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Plan change failed");
    } finally {
      setBusy(false);
    }
  };

  return { startCheckout, changePlan, busy };
}
