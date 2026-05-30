import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { DocEditor } from "@/components/DocEditor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { complaintTypeById } from "@/lib/complaint-types";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/complaints/$id")({
  head: () => ({ meta: [{ title: "Edit Complaint — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <ComplaintEditor />
    </RequireAuth>
  ),
});

function ComplaintEditor() {
  const { id } = useParams({ from: "/complaints/$id" });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [complaintType, setComplaintType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("en");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) { toast.error("Complaint not found"); navigate({ to: "/complaints" }); return; }
      setComplaintType(data.complaint_type);
      setTitle(data.title);
      setLanguage(data.language ?? "en");
      setFormData((data.form_data as Record<string, string>) ?? {});
      setContent(data.generated_content ?? "");
      setLoading(false);
    })();
  }, [id, user, navigate]);

  const type = complaintTypeById(complaintType);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("complaints")
      .update({
        title,
        language,
        form_data: formData,
        generated_content: content,
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
        body: JSON.stringify({
          kind: "complaint",
          subType: type?.label ?? complaintType,
          language,
          data: { recipient: type?.recipient, ...formData },
        }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error ?? "Generation failed");
      setContent(json.content);
      toast.success("Draft generated — review and edit before saving.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !type) {
    return (
      <DashboardShell title="Loading…">
        <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={type.label}>
      <DocEditor
        title={title}
        onTitleChange={setTitle}
        fields={type.fields}
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
        headerNote={`Addressed to: ${type.recipient}`}
      />
    </DashboardShell>
  );
}
