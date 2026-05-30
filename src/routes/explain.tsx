import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, FileSearch } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { AnalyzerPanel, severityClass } from "@/components/AnalyzerPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Clause = { title: string; explanation: string; importance: string };
type Risk = { label: string; severity: string; detail: string };
type Deadline = { when: string; what: string };
type DocResult = { summary?: string; clauses?: Clause[]; risks?: Risk[]; deadlines?: Deadline[]; actions?: string[] };

export const Route = createFileRoute("/explain")({
  head: () => ({ meta: [{ title: "Document Explain AI — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <ExplainPage />
    </RequireAuth>
  ),
});

function ExplainPage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<DocResult | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("document_analyses").select("id,title,created_at").order("created_at", { ascending: false }).limit(20).then(({ data }) => setHistory(data ?? []));
  }, [user, saving]);

  const save = async () => {
    if (!user || !result) return;
    setSaving(true);
    const title = result.summary?.slice(0, 80) || "Document analysis";
    const { error } = await supabase.from("document_analyses").insert({
      user_id: user.id,
      title,
      doc_kind: "general",
      source_text: sourceText.slice(0, 30000),
      language,
      summary: result.summary ?? null,
      clauses: (result.clauses ?? []) as never,
      risks: (result.risks ?? []) as never,
      deadlines: (result.deadlines ?? []) as never,
      actions: (result.actions ?? []) as never,
      raw_analysis: JSON.stringify(result),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved to history");
  };

  return (
    <DashboardShell title="Document Explain AI">
      <AnalyzerPanel<DocResult>
        kind="document"
        title="Explain a document"
        placeholder="Paste contract, loan agreement, lease, insurance policy text — or upload PDF/image."
        language={language}
        onLanguageChange={setLanguage}
        onResult={(t, r) => { setSourceText(t); setResult(r); }}
        onSave={save}
        saving={saving}
        result={result}
        renderResult={(r) => (
          <div className="space-y-4">
            {r.summary && (
              <Section title="Plain-language summary"><p className="text-sm leading-relaxed">{r.summary}</p></Section>
            )}
            {!!r.risks?.length && (
              <Section title="Risk highlights">
                <ul className="space-y-2">
                  {r.risks.map((x, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${severityClass(x.severity)}`}>{x.severity}</span>
                      <div><div className="text-sm font-medium">{x.label}</div><div className="text-xs text-muted-foreground">{x.detail}</div></div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {!!r.clauses?.length && (
              <Section title="Important clauses">
                <ul className="space-y-2">
                  {r.clauses.map((c, i) => (
                    <li key={i} className="border border-border/60 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium">{c.title}</div>
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${severityClass(c.importance)}`}>{c.importance}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.explanation}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {!!r.deadlines?.length && (
              <Section title="Key deadlines">
                <ul className="space-y-1.5">
                  {r.deadlines.map((d, i) => (<li key={i} className="text-sm"><span className="text-primary font-medium">{d.when}</span> — {d.what}</li>))}
                </ul>
              </Section>
            )}
            {!!r.actions?.length && (
              <Section title="Recommended actions">
                <ul className="space-y-1 text-sm list-disc pl-5">{r.actions.map((a, i) => (<li key={i}>{a}</li>))}</ul>
              </Section>
            )}
          </div>
        )}
      />
      {!!history.length && (
        <div className="mt-8 rounded-xl border border-border/60 bg-card-elegant p-5">
          <div className="flex items-center gap-2 mb-3"><FileSearch className="w-4 h-4 text-primary" /><h3 className="font-display text-base font-semibold">Recent analyses</h3></div>
          <ul className="divide-y divide-border/60">
            {history.map((h) => (
              <li key={h.id} className="py-2 flex items-center justify-between">
                <Link to="/explain" className="text-sm truncate hover:text-primary">{h.title}</Link>
                <span className="text-[11px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
      <div className="flex items-center gap-2 mb-3"><ChevronRight className="w-4 h-4 text-primary" /><h3 className="font-display text-base font-semibold">{title}</h3></div>
      {children}
    </div>
  );
}
