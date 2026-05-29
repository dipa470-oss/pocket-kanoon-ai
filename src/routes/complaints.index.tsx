import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { complaintTypeById } from "@/lib/complaint-types";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints/")({
  head: () => ({ meta: [{ title: "Complaints — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <ComplaintsList />
    </RequireAuth>
  ),
});

type Row = { id: string; title: string; complaint_type: string; status: string; updated_at: string };

function ComplaintsList() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("complaints")
      .select("id,title,complaint_type,status,updated_at")
      .order("updated_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Delete this complaint?")) return;
    const { error } = await supabase.from("complaints").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <DashboardShell title="Complaints">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">All your AI-drafted complaints in one place.</p>
        <Link to="/complaints/new" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold hover:opacity-90">
          <Plus className="w-4 h-4" /> New Complaint
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg mb-1">No complaints yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Get started with an AI-drafted complaint.</p>
          <Link to="/complaints/new" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold">
            <Plus className="w-4 h-4" /> Generate first complaint
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => {
            const type = complaintTypeById(r.complaint_type);
            return (
              <div key={r.id} className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border/60 bg-card-elegant hover:border-primary/50 transition-colors">
                <Link to="/complaints/$id" params={{ id: r.id }} className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    {type?.label ?? r.complaint_type} · {r.status} · {new Date(r.updated_at).toLocaleDateString()}
                  </div>
                </Link>
                <button onClick={() => remove(r.id)} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
