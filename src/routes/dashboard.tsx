import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, ShieldAlert, MessageSquare, FolderOpen, Sparkles, Crown, Bell, ArrowRight, FileSearch, ShieldCheck, Gavel, Landmark } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { planLabelWithBilling } from "@/lib/admin/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Pocket Lawyer AI" }],
  }),
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ complaints: 0, fir: 0, chats: 0, docs: 0, explains: 0, scams: 0, notices: 0, properties: 0 });
  const [recentComplaints, setRecentComplaints] = useState<{ id: string; title: string; complaint_type: string; updated_at: string }[]>([]);
  const [recentFir, setRecentFir] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, f, ch, d, ex, sc, no, pr, rc, rf, sub] = await Promise.all([
        supabase.from("complaints").select("id", { count: "exact", head: true }),
        supabase.from("fir_drafts").select("id", { count: "exact", head: true }),
        supabase.from("conversations").select("id", { count: "exact", head: true }),
        supabase.from("user_documents").select("id", { count: "exact", head: true }),
        supabase.from("document_analyses").select("id", { count: "exact", head: true }),
        supabase.from("scam_reports").select("id", { count: "exact", head: true }),
        supabase.from("legal_notice_reviews").select("id", { count: "exact", head: true }),
        supabase.from("property_verifications").select("id", { count: "exact", head: true }),
        supabase.from("complaints").select("id,title,complaint_type,updated_at").order("updated_at", { ascending: false }).limit(5),
        supabase.from("fir_drafts").select("id,title,updated_at").order("updated_at", { ascending: false }).limit(5),
        supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
      ]);
      if (sub.data?.plan) setPlan(sub.data.plan);
      setCounts({
        complaints: c.count ?? 0, fir: f.count ?? 0, chats: ch.count ?? 0, docs: d.count ?? 0,
        explains: ex.count ?? 0, scams: sc.count ?? 0, notices: no.count ?? 0, properties: pr.count ?? 0,
      });
      setRecentComplaints(rc.data ?? []);
      setRecentFir(rf.data ?? []);
    })();
  }, [user]);

  const cards = [
    { label: "Complaints", count: counts.complaints, icon: FileText, to: "/complaints" as const },
    { label: "FIR Drafts", count: counts.fir, icon: ShieldAlert, to: "/fir" as const },
    { label: "AI Chats", count: counts.chats, icon: MessageSquare, to: "/chat" as const },
    { label: "Documents", count: counts.docs, icon: FolderOpen, to: "/documents" as const },
    { label: "Explained", count: counts.explains, icon: FileSearch, to: "/explain" as const },
    { label: "Scam Checks", count: counts.scams, icon: ShieldCheck, to: "/scam" as const },
    { label: "Notices", count: counts.notices, icon: Gavel, to: "/notice-check" as const },
    { label: "Property", count: counts.properties, icon: Landmark, to: "/property-verify" as const },
  ];

  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-8">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, count, icon: Icon, to }) => (
            <Link
              key={label}
              to={to}
              className="group rounded-xl border border-border/60 bg-card-elegant p-5 hover:border-primary/50 transition-all shadow-elegant"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-primary" />
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="font-display text-3xl font-semibold">{count}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </Link>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-5">
          <Link
            to="/complaints/new"
            className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 hover:border-primary transition-all"
          >
            <Sparkles className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-display text-lg font-semibold mb-1">Generate Complaint</h3>
            <p className="text-sm text-muted-foreground">AI-drafted complaint in minutes — choose from 10 categories.</p>
          </Link>
          <Link
            to="/fir/new"
            className="rounded-xl border border-border/60 bg-card-elegant p-6 hover:border-primary/50 transition-all"
          >
            <ShieldAlert className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-display text-lg font-semibold mb-1">New FIR Draft</h3>
            <p className="text-sm text-muted-foreground">Professional FIR draft with state-wise guidance.</p>
          </Link>
          <Link
            to="/chat"
            className="rounded-xl border border-border/60 bg-card-elegant p-6 hover:border-primary/50 transition-all"
          >
            <MessageSquare className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-display text-lg font-semibold mb-1">Ask AI Lawyer</h3>
            <p className="text-sm text-muted-foreground">24/7 multilingual legal assistant.</p>
          </Link>
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <RecentList title="Recent Complaints" items={recentComplaints.map(r => ({ id: r.id, title: r.title, sub: r.complaint_type, date: r.updated_at }))} basePath="/complaints" empty="No complaints yet." />
          <RecentList title="Recent FIR Drafts" items={recentFir.map(r => ({ id: r.id, title: r.title, sub: "FIR", date: r.updated_at }))} basePath="/fir" empty="No FIR drafts yet." />
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-border/60 bg-card-elegant p-6">
            <div className="flex items-center gap-2 mb-2"><Crown className="w-5 h-5 text-primary" /><h3 className="font-display text-lg font-semibold">Subscription</h3></div>
            <p className="text-sm text-muted-foreground mb-4">
              You are on the <span className="text-primary font-medium">{planLabelWithBilling(plan)}</span>.
              {plan === "free" && " Unlock unlimited drafts and lawyer consultations."}
            </p>
            <Link to="/billing" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">Manage billing <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="rounded-xl border border-border/60 bg-card-elegant p-6">
            <div className="flex items-center gap-2 mb-2"><Bell className="w-5 h-5 text-primary" /><h3 className="font-display text-lg font-semibold">Notifications</h3></div>
            <p className="text-sm text-muted-foreground">You're all caught up.</p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function RecentList({ title, items, basePath, empty }: { title: string; items: { id: string; title: string; sub: string; date: string }[]; basePath: string; empty: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card-elegant p-6">
      <h3 className="font-display text-lg font-semibold mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`${basePath}/${it.id}`}
                className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-accent/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{it.title}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{it.sub}</div>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{new Date(it.date).toLocaleDateString()}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
