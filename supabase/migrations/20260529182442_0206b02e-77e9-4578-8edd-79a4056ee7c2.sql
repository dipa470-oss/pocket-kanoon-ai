
-- COMPLAINTS
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  complaint_type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Complaint',
  recipient TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own complaints" ON public.complaints
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER complaints_updated_at BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_complaints_user ON public.complaints(user_id, created_at DESC);

-- FIR DRAFTS
CREATE TABLE public.fir_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled FIR',
  state TEXT,
  police_station TEXT,
  incident_date DATE,
  incident_location TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fir_drafts TO authenticated;
GRANT ALL ON public.fir_drafts TO service_role;
ALTER TABLE public.fir_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own fir drafts" ON public.fir_drafts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER fir_drafts_updated_at BEFORE UPDATE ON public.fir_drafts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_fir_user ON public.fir_drafts(user_id, created_at DESC);

-- USER DOCUMENTS
CREATE TABLE public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  doc_type TEXT,
  notes TEXT,
  storage_path TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_documents TO authenticated;
GRANT ALL ON public.user_documents TO service_role;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON public.user_documents
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_documents_updated_at BEFORE UPDATE ON public.user_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_user_documents_user ON public.user_documents(user_id, created_at DESC);

-- SAVED EXPORTS
CREATE TABLE public.saved_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  format TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_exports TO authenticated;
GRANT ALL ON public.saved_exports TO service_role;
ALTER TABLE public.saved_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own exports" ON public.saved_exports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_saved_exports_user ON public.saved_exports(user_id, created_at DESC);
