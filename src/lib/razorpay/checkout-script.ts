const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let loadPromise: Promise<void> | null = null;

export function loadRazorpayCheckout(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.Razorpay) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });

  return loadPromise;
}

export type RazorpayCheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

export type OpenSubscriptionCheckoutParams = {
  keyId: string;
  subscriptionId: string;
  planId: string;
  userName?: string;
  userEmail?: string;
  onSuccess: (response: RazorpayCheckoutResponse) => void | Promise<void>;
  onDismiss?: () => void;
};

export async function openSubscriptionCheckout(params: OpenSubscriptionCheckoutParams) {
  await loadRazorpayCheckout();

  const RazorpayCtor = window.Razorpay;
  if (!RazorpayCtor) throw new Error("Razorpay SDK unavailable");

  return new Promise<void>((resolve, reject) => {
    const rzp = new RazorpayCtor({
      key: params.keyId,
      subscription_id: params.subscriptionId,
      name: "Pocket Lawyer AI",
      description: `Subscription — ${params.planId}`,
      prefill: {
        name: params.userName,
        email: params.userEmail,
      },
      theme: { color: "#c9a227" },
      handler: async (response: RazorpayCheckoutResponse) => {
        try {
          await params.onSuccess(response);
          resolve();
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => {
          params.onDismiss?.();
          reject(new Error("Checkout closed"));
        },
      },
    });
    rzp.open();
  });
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}
