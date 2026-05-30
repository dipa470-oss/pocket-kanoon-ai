import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gavel } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { AnalyzerPanel, severityClass } from "@/components/AnalyzerPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type NoticeResult = {
  summary?: string;
  risk_level?: string;
  urgency_score?: number;
  deadlines?: { when: string; what: string }[];
  recommended_response?: string;
};

export const Route = createFileRoute("/notice-check")({
  head: () => ({ meta: [{ title: "Legal Notice Checker — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <NoticePage />
    </RequireAuth>
  ),
});

function NoticePage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<NoticeResult | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; risk_level: string; urgency_score: number; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("legal_notice_reviews").select("id,title,risk_level,urgency_score,created_at").order("created_at", { ascending: false }).limit(20).then(({ data }) => setHistory(data ?? []));
  }, [user, saving]);

  const save = async () => {
    if (!user || !result) return;
    setSaving(true);
    const { error } = await supabase.from("legal_notice_reviews").insert({
      user_id: user.id,
      title: (result.summary ?? "Legal notice review").slice(0, 80),
      notice_text: text.slice(0, 30000),
      language,
      summary: result.summary ?? null,
      risk_level: result.risk_level ?? "unknown",
      urgency_score: Math.max(0, Math.min(100, Number(result.urgency_score) || 0)),
      deadlines: (result.deadlines ?? []) as never,
      recommended_response: result.recommended_response ?? null,
      raw_analysis: JSON.stringify(result),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Review saved");
  };

  return (
    <DashboardShell title="Legal Notice Checker">
      <AnalyzerPanel<NoticeResult>
        kind="notice"
        title="Review a legal notice"
        placeholder="Paste the legal notice text — or upload PDF/image."
        language={language}
        onLanguageChange={setLanguage}
        onResult={(t, r) => { setText(t); setResult(r); }}
        onSave={save}
        saving={saving}
        result={result}
        renderResult={(r) => (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${severityClass(r.risk_level)}`}>{r.risk_level ?? "unknown"} risk</span>
                <span className="text-xs text-muted-foreground">Urgency <span className="font-display text-base text-foreground">{r.urgency_score ?? 0}</span>/100</span>
              </div>
              <h3 className="font-display text-base font-semibold mb-2">Plain-language summary</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
            </div>
            {!!r.deadlines?.length && (
              <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
                <h3 className="font-display text-base font-semibold mb-3">Deadlines</h3>
                <ul className="space-y-1.5">
                  {r.deadlines.map((d, i) => (<li key={i} className="text-sm"><span className="text-primary font-medium">{d.when}</span> — {d.what}</li>))}
                </ul>
              </div>
            )}
            {r.recommended_response && (
              <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
                <h3 className="font-display text-base font-semibold mb-3">Recommended response</h3>
                <pre className="whitespace-pre-wrap text-sm font-sans text-muted-foreground">{r.recommended_response}</pre>
              </div>
            )}
          </div>
        )}
      />
      {!!history.length && (
        <div className="mt-8 rounded-xl border border-border/60 bg-card-elegant p-5">
          <div className="flex items-center gap-2 mb-3"><Gavel className="w-4 h-4 text-primary" /><h3 className="font-display text-base font-semibold">Recent reviews</h3></div>
          <ul className="divide-y divide-border/60">
            {history.map((h) => (
              <li key={h.id} className="py-2 flex items-center justify-between gap-3">
                <span className="text-sm truncate flex-1">{h.title}</span>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${severityClass(h.risk_level)}`}>{h.risk_level}</span>
                <span className="text-[11px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}
