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

type Row = {
  id: string;
  user_id: string;
  title: string;
  doc_kind: string;
  status: string;
  language: string;
  summary: string | null;
  created_at: string;
};

export const Route = createFileRoute("/admin/documents")({
  component: AdminDocumentsPage,
});

function AdminDocumentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("document_analyses")
      .select("id,user_id,title,doc_kind,status,language,summary,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-8">
        <AdminPageHeader
          title="Document analyses"
          description="AI explain-document history including summaries and risk scans."
        />
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
                <TableHead>Kind</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <DocRowGroup key={r.id} row={r} expanded={expanded} setExpanded={setExpanded} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function DocRowGroup({
  row: r,
  expanded,
  setExpanded,
}: {
  row: Row;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-accent/30"
        onClick={() => setExpanded(expanded === r.id ? null : r.id)}
      >
        <TableCell className="font-medium max-w-[220px] truncate">{r.title}</TableCell>
        <TableCell>
          <Badge variant="outline">{r.doc_kind}</Badge>
        </TableCell>
        <TableCell>{r.status}</TableCell>
        <TableCell className="font-mono text-xs">{shortId(r.user_id)}</TableCell>
        <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(r.created_at)}</TableCell>
      </TableRow>
      {expanded === r.id && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/20 text-sm text-muted-foreground p-4">
            {r.summary ?? "No summary stored."}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
