import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Scale, Send, Loader2, LogOut, Plus, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

type Msg = { id?: string; role: "user" | "assistant"; content: string };
type Conv = { id: string; title: string; updated_at: string };

const LANGS = [
  ["en", "English"],
  ["hi", "हिन्दी"],
  ["bn", "বাংলা"],
  ["mr", "मराठी"],
  ["ta", "தமிழ்"],
  ["te", "తెలుగు"],
  ["gu", "ગુજરાતી"],
  ["pa", "ਪੰਜਾਬੀ"],
  ["or", "ଓଡ଼ିଆ"],
  ["as", "অসমীয়া"],
] as const;

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Personal Lawyer — Pocket Lawyer AI" },
      { name: "description", content: "Chat with your 24/7 AI legal assistant for India." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conv[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState<string>("en");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  // load conversations
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("conversations")
        .select("id,title,updated_at")
        .order("updated_at", { ascending: false });
      setConversations(data ?? []);
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .maybeSingle();
      if (profile?.preferred_language) setLanguage(profile.preferred_language);
    })();
  }, [user]);

  // load messages when convId changes
  useEffect(() => {
    if (!convId) {
      setMessages([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id,role,content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as Msg[]);
    })();
  }, [convId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const newChat = () => {
    setConvId(null);
    setMessages([]);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const ensureConversation = async (firstUserMessage: string): Promise<string | null> => {
    if (convId) return convId;
    if (!user) return null;
    const title = firstUserMessage.slice(0, 60);
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title, module: "personal_lawyer" })
      .select("id,title,updated_at")
      .single();
    if (error || !data) {
      toast.error("Could not start conversation");
      return null;
    }
    setConvId(data.id);
    setConversations((prev) => [data, ...prev]);
    return data.id;
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || !user) return;
    setInput("");
    setSending(true);

    const cid = await ensureConversation(text);
    if (!cid) {
      setSending(false);
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);

    // persist user message
    await supabase
      .from("messages")
      .insert({ conversation_id: cid, user_id: user.id, role: "user", content: text });

    let assistantText = "";
    try {
      const resp = await authenticatedFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map(({ role, content }) => ({ role, content })),
          language,
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errJson.error || `HTTP ${resp.status}`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantText += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      if (assistantText) {
        await supabase.from("messages").insert({
          conversation_id: cid,
          user_id: user.id,
          role: "assistant",
          content: assistantText,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/40 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2.5 px-4 h-16 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center shadow-gold">
            <Scale className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-base font-semibold">Pocket Lawyer</span>
        </Link>

        <div className="p-3">
          <button
            onClick={newChat}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground text-sm font-medium shadow-gold hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setConvId(c.id)}
              className={`w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-md transition-colors truncate ${
                convId === c.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 flex-none" />
              <span className="truncate">{c.title}</span>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground/70 px-3 py-2">No chats yet.</p>
          )}
        </div>

        <div className="border-t border-border p-3 space-y-2">
          <div className="text-xs text-muted-foreground truncate" title={user.email ?? ""}>
            {user.email}
          </div>
          <button
            onClick={signOut}
            className="w-full inline-flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md py-1.5"
          >
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6">
          <div>
            <h1 className="font-display text-lg">AI Personal Lawyer</h1>
            <p className="text-[11px] text-muted-foreground -mt-0.5">
              General legal guidance for India · not a substitute for an advocate
            </p>
          </div>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              void supabase
                .from("profiles")
                .upsert({ id: user.id, preferred_language: e.target.value });
            }}
            className="text-xs bg-background border border-border rounded-md px-2 py-1.5"
          >
            {LANGS.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center shadow-gold mb-4">
                  <Scale className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <h2 className="font-display text-2xl mb-2">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Ask anything — file an FIR, decode a legal notice, identify a loan-app scam, or
                  understand your tenant rights.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 mt-6 max-w-xl mx-auto">
                  {[
                    "Draft an FIR for a stolen phone",
                    "A loan app is threatening me — what should I do?",
                    "Explain my rental agreement",
                    "How do I file an RTI?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-left text-sm px-4 py-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {m.content || (sending && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={send} className="border-t border-border p-4 md:px-8">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(e as unknown as FormEvent);
                }
              }}
              placeholder="Ask your legal question…"
              rows={1}
              className="flex-1 resize-none px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-40"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="h-12 w-12 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="max-w-3xl mx-auto mt-2 text-[10px] text-muted-foreground/70 text-center">
            For emergencies dial 112. AI responses are informational only.
          </p>
        </form>
      </main>
    </div>
  );
}
