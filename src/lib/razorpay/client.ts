import Razorpay from "razorpay";
import { getRazorpayKeyId, getRazorpayKeySecret, razorpayConfigured } from "./config";

let instance: Razorpay | undefined;

export function getRazorpayClient(): Razorpay {
  if (!razorpayConfigured()) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  if (!instance) {
    instance = new Razorpay({
      key_id: getRazorpayKeyId()!,
      key_secret: getRazorpayKeySecret()!,
    });
  }
  return instance;
}
