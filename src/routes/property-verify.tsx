import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Landmark, Check, X } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { AnalyzerPanel, severityClass } from "@/components/AnalyzerPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type PropResult = {
  summary?: string;
  ownership_checklist?: { item: string; present: boolean; note: string }[];
  missing_fields?: string[];
  risks?: { label: string; severity: string; detail: string }[];
  guidance?: string;
};

export const Route = createFileRoute("/property-verify")({
  head: () => ({ meta: [{ title: "Property Paper Verifier — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <PropertyPage />
    </RequireAuth>
  ),
});

function PropertyPage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState("en");
  const [propertyType, setPropertyType] = useState<"registry" | "mutation" | "land_record" | "sale_deed" | "agreement">("registry");
  const [state, setState] = useState("");
  const [result, setResult] = useState<PropResult | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string; property_type: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("property_verifications").select("id,title,property_type,created_at").order("created_at", { ascending: false }).limit(20).then(({ data }) => setHistory(data ?? []));
  }, [user, saving]);

  const save = async () => {
    if (!user || !result) return;
    setSaving(true);
    const { error } = await supabase.from("property_verifications").insert({
      user_id: user.id,
      title: (result.summary ?? "Property verification").slice(0, 80),
      property_type: propertyType,
      state: state || null,
      source_text: text.slice(0, 30000),
      language,
      summary: result.summary ?? null,
      ownership_checklist: (result.ownership_checklist ?? []) as never,
      missing_fields: (result.missing_fields ?? []) as never,
      risks: (result.risks ?? []) as never,
      guidance: result.guidance ?? null,
      raw_analysis: JSON.stringify(result),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Verification saved");
  };

  return (
    <DashboardShell title="Property Paper Verifier">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type:</span>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as typeof propertyType)} className="text-xs bg-background border border-border rounded px-2 py-1">
            <option value="registry">Registry</option>
            <option value="mutation">Mutation</option>
            <option value="land_record">Land record</option>
            <option value="sale_deed">Sale deed</option>
            <option value="agreement">Agreement</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">State:</span>
          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Maharashtra" className="text-xs bg-background border border-border rounded px-2 py-1 w-40" />
        </div>
      </div>
      <AnalyzerPanel<PropResult>
        kind="property"
        title="Verify property paper"
        placeholder="Paste registry / mutation / land record text — or upload PDF/image."
        language={language}
        onLanguageChange={setLanguage}
        onResult={(t, r) => { setText(t); setResult(r); }}
        onSave={save}
        saving={saving}
        result={result}
        renderResult={(r) => (
          <div className="space-y-4">
            {r.summary && (
              <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
                <h3 className="font-display text-base font-semibold mb-2">Summary</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
              </div>
            )}
            {!!r.ownership_checklist?.length && (
              <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
                <h3 className="font-display text-base font-semibold mb-3">Ownership checklist</h3>
                <ul className="space-y-2">
                  {r.ownership_checklist.map((c, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm">
                      {c.present ? <Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" /> : <X className="w-4 h-4 mt-0.5 text-destructive shrink-0" />}
                      <div><div className="font-medium">{c.item}</div><div className="text-xs text-muted-foreground">{c.note}</div></div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!!r.missing_fields?.length && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
                <h3 className="font-display text-base font-semibold mb-2 text-amber-500">Missing fields</h3>
                <ul className="text-sm list-disc pl-5 space-y-0.5">{r.missing_fields.map((m, i) => (<li key={i}>{m}</li>))}</ul>
              </div>
            )}
            {!!r.risks?.length && (
              <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
                <h3 className="font-display text-base font-semibold mb-3">Risk alerts</h3>
                <ul className="space-y-2">
                  {r.risks.map((x, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${severityClass(x.severity)}`}>{x.severity}</span>
                      <div><div className="text-sm font-medium">{x.label}</div><div className="text-xs text-muted-foreground">{x.detail}</div></div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {r.guidance && (
              <div className="rounded-xl border border-border/60 bg-card-elegant p-5">
                <h3 className="font-display text-base font-semibold mb-2">Verification guidance</h3>
                <pre className="whitespace-pre-wrap text-sm font-sans text-muted-foreground">{r.guidance}</pre>
              </div>
            )}
          </div>
        )}
      />
      {!!history.length && (
        <div className="mt-8 rounded-xl border border-border/60 bg-card-elegant p-5">
          <div className="flex items-center gap-2 mb-3"><Landmark className="w-4 h-4 text-primary" /><h3 className="font-display text-base font-semibold">Recent verifications</h3></div>
          <ul className="divide-y divide-border/60">
            {history.map((h) => (
              <li key={h.id} className="py-2 flex items-center justify-between gap-3">
                <span className="text-sm truncate flex-1">{h.title}</span>
                <span className="text-[10px] uppercase text-muted-foreground">{h.property_type}</span>
                <span className="text-[11px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}
