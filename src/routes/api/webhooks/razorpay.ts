import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifyWebhookSignature } from "@/lib/razorpay/verify";
import {
  markWebhookProcessed,
  processRazorpayWebhook,
  storeWebhookEvent,
} from "@/lib/razorpay/webhooks";

export const Route = createFileRoute("/api/webhooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        if (!verifyWebhookSignature(rawBody, signature)) {
          return Response.json({ error: "Invalid signature" }, { status: 401 });
        }

        let body: Parameters<typeof processRazorpayWebhook>[0] & { id?: string };
        try {
          body = JSON.parse(rawBody);
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const eventId =
          (typeof body.id === "string" && body.id) ||
          `${body.event}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const { data: existingEvent } = await supabaseAdmin
          .from("razorpay_webhook_events")
          .select("processed_at")
          .eq("event_id", eventId)
          .maybeSingle();

        if (existingEvent?.processed_at) {
          return Response.json({ received: true, duplicate: true });
        }

        await storeWebhookEvent(eventId, body.event ?? "unknown", body);

        try {
          await processRazorpayWebhook(body, eventId);
          await markWebhookProcessed(eventId);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Webhook processing failed";
          console.error("[razorpay webhook]", err);
          await markWebhookProcessed(eventId, message);
          return Response.json({ error: message }, { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
