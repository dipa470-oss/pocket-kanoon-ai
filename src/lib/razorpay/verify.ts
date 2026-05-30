import { createHmac, timingSafeEqual } from "node:crypto";
import { getRazorpayKeySecret, getRazorpayWebhookSecret } from "./config";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Verify Razorpay subscription payment signature after checkout. */
export function verifySubscriptionPaymentSignature(params: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = getRazorpayKeySecret();
  if (!secret) return false;
  const payload = `${params.razorpay_payment_id}|${params.razorpay_subscription_id}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return safeEqual(expected, params.razorpay_signature);
}

/** Verify Razorpay webhook `X-Razorpay-Signature` header. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = getRazorpayWebhookSecret();
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
