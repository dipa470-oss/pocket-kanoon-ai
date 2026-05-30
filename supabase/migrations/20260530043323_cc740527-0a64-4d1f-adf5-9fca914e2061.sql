-- Document Analyses
CREATE TABLE public.document_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  doc_kind TEXT NOT NULL DEFAULT 'general',
  source_text TEXT,
  storage_path TEXT,
  mime_type TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  summary TEXT,
  clauses JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  deadlines JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_analysis TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_analyses TO authenticated;
GRANT ALL ON public.document_analyses TO service_role;
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own document analyses" ON public.document_analyses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_document_analyses_updated BEFORE UPDATE ON public.document_analyses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Scam Reports
CREATE TABLE public.scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Scam Check',
  channel TEXT NOT NULL DEFAULT 'sms',
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  scam_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'unknown',
  indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT,
  raw_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scam_reports TO authenticated;
GRANT ALL ON public.scam_reports TO service_role;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scam reports" ON public.scam_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_scam_reports_updated BEFORE UPDATE ON public.scam_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Legal Notice Reviews
CREATE TABLE public.legal_notice_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Legal Notice Review',
  notice_text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  summary TEXT,
  risk_level TEXT NOT NULL DEFAULT 'unknown',
  urgency_score INTEGER NOT NULL DEFAULT 0,
  deadlines JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_response TEXT,
  raw_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_notice_reviews TO authenticated;
GRANT ALL ON public.legal_notice_reviews TO service_role;
ALTER TABLE public.legal_notice_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own legal notice reviews" ON public.legal_notice_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_legal_notice_reviews_updated BEFORE UPDATE ON public.legal_notice_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Property Verifications
CREATE TABLE public.property_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Property Verification',
  property_type TEXT NOT NULL DEFAULT 'registry',
  state TEXT,
  source_text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  summary TEXT,
  ownership_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  guidance TEXT,
  raw_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_verifications TO authenticated;
GRANT ALL ON public.property_verifications TO service_role;
ALTER TABLE public.property_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own property verifications" ON public.property_verifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_property_verifications_updated BEFORE UPDATE ON public.property_verifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();