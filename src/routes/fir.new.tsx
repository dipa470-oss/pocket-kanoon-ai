import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/fir/new")({
  component: () => (
    <RequireAuth>
      <NewFir />
    </RequireAuth>
  ),
});

function NewFir() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("fir_drafts")
        .insert({ user_id: user.id, title: "New FIR Draft" })
        .select("id")
        .single();
      if (error || !data) { toast.error(error?.message ?? "Failed"); navigate({ to: "/fir" }); return; }
      navigate({ to: "/fir/$id", params: { id: data.id }, replace: true });
    })();
  }, [user, navigate]);
  return (
    <DashboardShell title="Creating…">
      <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
    </DashboardShell>
  );
}
