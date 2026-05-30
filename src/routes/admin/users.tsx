import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, shortId } from "@/lib/admin/format";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

type UserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  preferred_language: string;
  created_at: string;
  roles: AppRole[];
};

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pErr || rErr) {
      toast.error(pErr?.message ?? rErr?.message ?? "Failed to load users");
      setLoading(false);
      return;
    }
    const roleMap = new Map<string, AppRole[]>();
    for (const r of roles ?? []) {
      const list = roleMap.get(r.user_id) ?? [];
      list.push(r.role);
      roleMap.set(r.user_id, list);
    }
    setRows(
      (profiles ?? []).map((p) => ({
        ...p,
        roles: roleMap.get(p.id) ?? ["user"],
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setRole = async (userId: string, role: AppRole) => {
    setBusyId(userId);
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) {
      toast.error(delErr.message);
      setBusyId(null);
      return;
    }
    const { error: insErr } = await supabase.from("user_roles").insert({ user_id: userId, role });
    setBusyId(null);
    if (insErr) toast.error(insErr.message);
    else {
      toast.success(`Role updated to ${role}`);
      load();
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-8">
        <AdminPageHeader
          title="Users"
          description="Manage registered citizens, contact details, and platform roles."
        />
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:border-primary/50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card-elegant overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.full_name ?? "—"}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{shortId(u.id)}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email ?? "—"}</TableCell>
                  <TableCell>{u.preferred_language}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(u.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {u.roles.map((r) => (
                        <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                          {r}
                        </Badge>
                      ))}
                      <select
                        disabled={busyId === u.id}
                        className="text-xs bg-background border border-border rounded px-2 py-1 ml-1"
                        value={u.roles[0] ?? "user"}
                        onChange={(e) => setRole(u.id, e.target.value as AppRole)}
                      >
                        <option value="user">user</option>
                        <option value="lawyer">lawyer</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
