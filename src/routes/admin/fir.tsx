import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
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

type Row = {
  id: string;
  user_id: string;
  title: string;
  state: string | null;
  police_station: string | null;
  status: string;
  updated_at: string;
  generated_content: string | null;
};

export const Route = createFileRoute("/admin/fir")({
  component: AdminFirPage,
});

function AdminFirPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fir_drafts")
      .select("id,user_id,title,state,police_station,status,updated_at,generated_content")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    if (!confirm("Delete this FIR draft?")) return;
    const { error } = await supabase.from("fir_drafts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-8">
        <AdminPageHeader title="FIR drafts" description="Review and moderate First Information Report drafts." />
        <button onClick={load} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card-elegant overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>State / PS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <FirRowGroup
                  key={r.id}
                  row={r}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  remove={remove}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function FirRowGroup({
  row: r,
  expanded,
  setExpanded,
  remove,
}: {
  row: Row;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  remove: (id: string) => void;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-accent/30"
        onClick={() => setExpanded(expanded === r.id ? null : r.id)}
      >
        <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {r.state ?? "—"} / {r.police_station ?? "—"}
        </TableCell>
        <TableCell>
          <Badge variant="outline">{r.status}</Badge>
        </TableCell>
        <TableCell className="font-mono text-xs">{shortId(r.user_id)}</TableCell>
        <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(r.updated_at)}</TableCell>
        <TableCell>
          <button
            onClick={(e) => {
              e.stopPropagation();
              remove(r.id);
            }}
            className="p-1.5 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </TableCell>
      </TableRow>
      {expanded === r.id && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/20">
            <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-y-auto p-3 font-mono">
              {r.generated_content ?? "(No draft content)"}
            </pre>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
