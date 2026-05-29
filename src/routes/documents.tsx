import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, FolderOpen } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <Documents />
    </RequireAuth>
  ),
});

type Row = { id: string; name: string; doc_type: string | null; notes: string | null; created_at: string };

function Documents() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [docType, setDocType] = useState("");
  const [notes, setNotes] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("user_documents")
      .select("id,name,doc_type,notes,created_at")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const add = async () => {
    if (!user || !name.trim()) return;
    const { error } = await supabase.from("user_documents").insert({
      user_id: user.id, name: name.trim(), doc_type: docType || null, notes: notes || null,
    });
    if (error) toast.error(error.message);
    else { setName(""); setDocType(""); setNotes(""); toast.success("Document saved"); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("user_documents").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <DashboardShell title="My Documents">
      <p className="text-sm text-muted-foreground mb-6">Track legal documents, references, and case notes.</p>

      <div className="rounded-xl border border-border/60 bg-card-elegant p-5 mb-6">
        <h3 className="font-display text-base font-semibold mb-3">Add Document Reference</h3>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (required)" className="px-3 py-2 rounded-md bg-background border border-border text-sm" />
          <input value={docType} onChange={e=>setDocType(e.target.value)} placeholder="Type (Aadhaar, FIR copy…)" className="px-3 py-2 rounded-md bg-background border border-border text-sm" />
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes" className="px-3 py-2 rounded-md bg-background border border-border text-sm" />
        </div>
        <button onClick={add} disabled={!name.trim()} className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FolderOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-display text-lg">No documents yet</h3>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border/60 bg-card-elegant">
              <div className="min-w-0">
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  {r.doc_type ?? "Document"} · {new Date(r.created_at).toLocaleDateString()}
                </div>
                {r.notes && <div className="text-xs text-muted-foreground mt-2">{r.notes}</div>}
              </div>
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
