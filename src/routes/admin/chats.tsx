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

type Conv = {
  id: string;
  user_id: string;
  title: string;
  module: string;
  updated_at: string;
};

type Msg = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export const Route = createFileRoute("/admin/chats")({
  component: AdminChatsPage,
});

function AdminChatsPage() {
  const [rows, setRows] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("conversations")
      .select("id,user_id,title,module,updated_at")
      .order("updated_at", { ascending: false })
      .limit(150);
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openConv = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      setMessages([]);
      return;
    }
    setExpanded(id);
    setLoadingMsgs(true);
    const { data, error } = await supabase
      .from("messages")
      .select("id,role,content,created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .limit(100);
    setLoadingMsgs(false);
    if (error) toast.error(error.message);
    else setMessages(data ?? []);
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-8">
        <AdminPageHeader
          title="AI chat history"
          description="Personal Lawyer conversations and message transcripts."
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
                <TableHead>Module</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Last active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <ChatRowGroup
                  key={r.id}
                  row={r}
                  expanded={expanded}
                  openConv={openConv}
                  loadingMsgs={loadingMsgs}
                  messages={expanded === r.id ? messages : []}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function ChatRowGroup({
  row: r,
  expanded,
  openConv,
  loadingMsgs,
  messages,
}: {
  row: Conv;
  expanded: string | null;
  openConv: (id: string) => void;
  loadingMsgs: boolean;
  messages: Msg[];
}) {
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-accent/30" onClick={() => openConv(r.id)}>
        <TableCell className="font-medium max-w-[240px] truncate">{r.title}</TableCell>
        <TableCell>
          <Badge variant="outline">{r.module}</Badge>
        </TableCell>
        <TableCell className="font-mono text-xs">{shortId(r.user_id)}</TableCell>
        <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(r.updated_at)}</TableCell>
      </TableRow>
      {expanded === r.id && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/20 p-4">
            {loadingMsgs ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages in this conversation.</p>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {messages.map((m) => (
                  <li key={m.id} className="text-sm">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold ${
                        m.role === "user" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {m.role}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-2">{formatDate(m.created_at)}</span>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{m.content.slice(0, 2000)}</p>
                  </li>
                ))}
              </ul>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
