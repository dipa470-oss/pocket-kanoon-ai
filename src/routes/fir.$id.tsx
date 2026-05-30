import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { DocEditor } from "@/components/DocEditor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { FIR_FIELDS } from "@/lib/complaint-types";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

export const Route = createFileRoute("/fir/$id")({
  head: () => ({ meta: [{ title: "FIR Draft — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <FirEditor />
    </RequireAuth>
  ),
});

function FirEditor() {
  const { id } = useParams({ from: "/fir/$id" });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("en");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.from("fir_drafts").select("*").eq("id", id).maybeSingle();
      if (error || !data) { toast.error("FIR draft not found"); navigate({ to: "/fir" }); return; }
      setTitle(data.title);
      setLanguage(data.language ?? "en");
      setFormData((data.form_data as Record<string, string>) ?? {});
      setContent(data.generated_content ?? "");
      setLoading(false);
    })();
  }, [id, user, navigate]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("fir_drafts")
      .update({
        title,
        language,
        form_data: formData,
        generated_content: content,
        state: formData.state ?? null,
        police_station: formData.police_station ?? null,
        incident_location: formData.incident_location ?? null,
        incident_date: formData.incident_date || null,
        status: content ? "drafted" : "draft",
      })
      .eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const resp = await authenticatedFetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "fir", subType: "FIR", language, data: formData }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error ?? "Generation failed");
      setContent(json.content);
      toast.success("FIR draft generated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Loading…">
        <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="FIR Draft">
      <DocEditor
        title={title}
        onTitleChange={setTitle}
        fields={FIR_FIELDS}
        formData={formData}
        onFormChange={setFormData}
        language={language}
        onLanguageChange={setLanguage}
        content={content}
        onContentChange={setContent}
        generating={generating}
        saving={saving}
        onGenerate={generate}
        onSave={save}
        headerNote="Filed under Section 173 BNSS / 154 CrPC. Cognizable offence FIRs must be registered free of charge."
      />
    </DashboardShell>
  );
}
