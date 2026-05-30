-- Razorpay subscription fields, billing history, webhook audit

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_razorpay_sub_id
  ON public.subscriptions (razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  razorpay_payment_id TEXT,
  razorpay_invoice_id TEXT,
  razorpay_order_id TEXT,
  amount_inr INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('paid', 'failed', 'refunded', 'pending')),
  plan TEXT CHECK (plan IN ('free', 'premium', 'premium_plus')),
  description TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_razorpay_payment
  ON public.billing_history (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_billing_user_created
  ON public.billing_history (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.razorpay_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type_created
  ON public.razorpay_webhook_events (event_type, created_at DESC);

GRANT SELECT ON public.billing_history TO authenticated;
GRANT ALL ON public.billing_history TO service_role;
GRANT SELECT ON public.razorpay_webhook_events TO authenticated;
GRANT ALL ON public.razorpay_webhook_events TO service_role;

ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razorpay_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own billing history" ON public.billing_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all billing history" ON public.billing_history
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view webhook events" ON public.razorpay_webhook_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
