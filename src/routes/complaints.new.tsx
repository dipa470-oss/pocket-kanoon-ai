import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { COMPLAINT_TYPES } from "@/lib/complaint-types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints/new")({
  head: () => ({ meta: [{ title: "New Complaint — Pocket Lawyer AI" }] }),
  component: () => (
    <RequireAuth>
      <NewComplaint />
    </RequireAuth>
  ),
});

function NewComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState<string | null>(null);

  const create = async (typeId: string, label: string, recipient: string) => {
    if (!user) return;
    setCreating(typeId);
    const { data, error } = await supabase
      .from("complaints")
      .insert({ user_id: user.id, complaint_type: typeId, title: `New ${label}`, recipient })
      .select("id")
      .single();
    setCreating(null);
    if (error || !data) { toast.error(error?.message ?? "Failed to create"); return; }
    navigate({ to: "/complaints/$id", params: { id: data.id } });
  };

  return (
    <DashboardShell title="Choose Complaint Type">
      <p className="text-sm text-muted-foreground mb-6">Select a category — we'll guide you through the form and draft the complaint with AI.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPLAINT_TYPES.map((t) => (
          <button
            key={t.id}
            disabled={creating === t.id}
            onClick={() => create(t.id, t.label, t.recipient)}
            className="text-left rounded-xl border border-border/60 bg-card-elegant p-5 hover:border-primary/60 transition-all disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg font-semibold">{t.label}</h3>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-3">{t.description}</p>
            <p className="text-[11px] uppercase tracking-wider text-primary/80">To: {t.recipient}</p>
          </button>
        ))}
      </div>
    </DashboardShell>
  );
}
