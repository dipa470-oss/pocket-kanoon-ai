import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { AnalyzerPanel, severityClass } from "@/components/AnalyzerPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type ScamResult = {
  summary?: string;
  scam_score?: number;
  risk_level?: string;
  indicators?: { label: string; detail: string }[];
  actions?: string[];
};

export const Route = createFileRoute("/scam")({
  head: () => ({ meta: [{ title: "Scam Detector AI — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <ScamPage />
    </RequireAuth>
  ),
});

function ScamPage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState("en");
  const [channel, setChannel] = useState<"sms" | "whatsapp" | "email" | "screenshot">("sms");
  const [result, setResult] = useState<ScamResult | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; risk_level: string; scam_score: number; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("scam_reports").select("id,title,risk_level,scam_score,created_at").order("created_at", { ascending: false }).limit(20).then(({ data }) => setHistory(data ?? []));
  }, [user, saving]);

  const save = async () => {
    if (!user || !result) return;
    setSaving(true);
    const { error } = await supabase.from("scam_reports").insert({
      user_id: user.id,
      title: (result.summary ?? "Scam check").slice(0, 80),
      channel,
      content: text.slice(0, 20000),
      language,
      scam_score: Math.max(0, Math.min(100, Number(result.scam_score) || 0)),
      risk_level: result.risk_level ?? "unknown",
      indicators: (result.indicators ?? []) as never,
      actions: (result.actions ?? []) as never,
      explanation: result.summary ?? null,
      raw_analysis: JSON.stringify(result),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Report saved");
  };

  return (
    <DashboardShell title="Scam Detector AI">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Channel:</span>
        {(["sms", "whatsapp", "email", "screenshot"] as const).map((c) => (
          <button key={c} onClick={() => setChannel(c)} className={`text-xs px-2.5 py-1 rounded-full border ${channel === c ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>{c.toUpperCase()}</button>
        ))}
      </div>
      <AnalyzerPanel<ScamResult>
        kind="scam"
        title="Check a message"
        placeholder="Paste the SMS / WhatsApp / email content — or upload a screenshot."
        language={language}
        onLanguageChange={setLanguage}
        onResult={(t, r) => { setText(t); setResult(r); }}
        onSave={save}
        saving={saving}
        result={result}
        renderResult={(r) => (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-4 border-primary/30">
                  <span className="font-display text-2xl font-semibold">{r.scam_score ?? 0}</span>
                  <span className="absolute -bottom-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-background px-2">score</span>
                </div>
                <div className="flex-1">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${severityClass(r.risk_level)}`}>{r.risk_level ?? "unknown"} risk</span>
                  <p className="text-sm mt-2 text-muted-foreground">{r.summary}</p>
                </div>
              </div>
            </div>
            {!!r.indicators?.length && (
              <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
                <h3 className="font-display text-base font-semibold mb-3">Fraud indicators</h3>
                <ul className="space-y-2">
                  {r.indicators.map((x, i) => (
                    <li key={i} className="text-sm"><span className="font-medium text-foreground">{x.label}</span> — <span className="text-muted-foreground">{x.detail}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {!!r.actions?.length && (
              <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
                <h3 className="font-display text-base font-semibold mb-3">Recommended actions</h3>
                <ul className="space-y-1 text-sm list-disc pl-5">{r.actions.map((a, i) => (<li key={i}>{a}</li>))}</ul>
                <p className="text-[11px] text-muted-foreground mt-3">Report cyber fraud at <a className="underline" href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">cybercrime.gov.in</a> or call 1930.</p>
              </div>
            )}
          </div>
        )}
      />
      {!!history.length && (
        <div className="mt-8 rounded-xl border border-border/60 bg-card-elegant p-5">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4 text-primary" /><h3 className="font-display text-base font-semibold">Recent reports</h3></div>
          <ul className="divide-y divide-border/60">
            {history.map((h) => (
              <li key={h.id} className="py-2 flex items-center justify-between gap-3">
                <span className="text-sm truncate flex-1">{h.title}</span>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${severityClass(h.risk_level)}`}>{h.risk_level}</span>
                <span className="text-[11px] text-muted-foreground">{h.scam_score}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}
