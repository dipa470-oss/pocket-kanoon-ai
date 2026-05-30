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
  complaint_type: string;
  status: string;
  language: string;
  updated_at: string;
  generated_content: string | null;
};

export const Route = createFileRoute("/admin/complaints")({
  component: AdminComplaintsPage,
});

function AdminComplaintsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select("id,user_id,title,complaint_type,status,language,updated_at,generated_content")
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
    if (!confirm("Delete this complaint permanently?")) return;
    const { error } = await supabase.from("complaints").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-8">
        <AdminPageHeader title="Complaints" description="All user-generated complaint drafts across the platform." />
        <button
          onClick={load}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border"
        >
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
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRowGroup key={r.id} row={r} expanded={expanded} setExpanded={setExpanded} remove={remove} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function TableRowGroup({
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
                    <TableCell>
                      <Badge variant="outline">{r.complaint_type}</Badge>
                    </TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{shortId(r.user_id)}</TableCell>
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
              {r.generated_content ?? "(No generated content yet)"}
            </pre>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
