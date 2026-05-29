import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldAlert, BookOpen } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/fir/")({
  head: () => ({ meta: [{ title: "FIR Drafts — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <FirList />
    </RequireAuth>
  ),
});

type Row = { id: string; title: string; state: string | null; updated_at: string; status: string };

function FirList() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("fir_drafts")
      .select("id,title,state,updated_at,status")
      .order("updated_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Delete this FIR draft?")) return;
    const { error } = await supabase.from("fir_drafts").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <DashboardShell title="FIR Drafts">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">First Information Report drafts for India.</p>
        <Link to="/fir/new" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold">
          <Plus className="w-4 h-4" /> New FIR Draft
        </Link>
      </div>

      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 mb-6 flex gap-4">
        <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm space-y-2">
          <p><strong>Your right to file an FIR (Section 173 BNSS / 154 CrPC):</strong> The SHO of any police station with jurisdiction must register your FIR for a cognizable offence. Free of charge. Demand a copy.</p>
          <p className="text-muted-foreground"><strong>If refused:</strong> Approach the SP in writing, then file a complaint under Sec 175(3) BNSS / 156(3) CrPC before the local Magistrate. For women and children, special officers must record statements.</p>
          <p className="text-muted-foreground"><strong>Required:</strong> Your ID proof, date/time/place of incident, accused details (if known), witness details, any supporting evidence. Mention any delay reason.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <ShieldAlert className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg mb-1">No FIR drafts yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first FIR draft with AI assistance.</p>
          <Link to="/fir/new" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold">
            <Plus className="w-4 h-4" /> New FIR Draft
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border/60 bg-card-elegant hover:border-primary/50">
              <Link to="/fir/$id" params={{ id: r.id }} className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.title}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {r.state ?? "FIR"} · {r.status} · {new Date(r.updated_at).toLocaleDateString()}
                </div>
              </Link>
              <button onClick={() => remove(r.id)} className="p-2 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
