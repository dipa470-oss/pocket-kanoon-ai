import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  ShieldAlert,
  MessageSquare,
  FileSearch,
  Crown,
  AlertTriangle,
  ScrollText,
  Home,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = {
  users: number;
  complaints: number;
  fir: number;
  chats: number;
  messages: number;
  documents: number;
  scams: number;
  notices: number;
  properties: number;
  premium: number;
  premiumPlus: number;
};

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [
        users,
        complaints,
        fir,
        chats,
        messages,
        documents,
        scams,
        notices,
        properties,
        subsPremium,
        subsPlus,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("complaints").select("id", { count: "exact", head: true }),
        supabase.from("fir_drafts").select("id", { count: "exact", head: true }),
        supabase.from("conversations").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("document_analyses").select("id", { count: "exact", head: true }),
        supabase.from("scam_reports").select("id", { count: "exact", head: true }),
        supabase.from("legal_notice_reviews").select("id", { count: "exact", head: true }),
        supabase.from("property_verifications").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("plan", "premium"),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("plan", "premium_plus"),
      ]);

      setStats({
        users: users.count ?? 0,
        complaints: complaints.count ?? 0,
        fir: fir.count ?? 0,
        chats: chats.count ?? 0,
        messages: messages.count ?? 0,
        documents: documents.count ?? 0,
        scams: scams.count ?? 0,
        notices: notices.count ?? 0,
        properties: properties.count ?? 0,
        premium: subsPremium.count ?? 0,
        premiumPlus: subsPlus.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Platform overview"
        description="Real-time counts across users, AI activity, and legal workflows."
      />
      {loading || !stats ? (
        <p className="text-sm text-muted-foreground">Loading statistics…</p>
      ) : (
        <div className="space-y-8">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Registered users" value={stats.users} icon={Users} />
            <StatCard label="AI conversations" value={stats.chats} hint={`${stats.messages} messages`} icon={MessageSquare} />
            <StatCard label="Complaints" value={stats.complaints} icon={FileText} />
            <StatCard label="FIR drafts" value={stats.fir} icon={ShieldAlert} />
          </section>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Document analyses" value={stats.documents} icon={FileSearch} />
            <StatCard label="Scam checks" value={stats.scams} icon={AlertTriangle} />
            <StatCard label="Notice reviews" value={stats.notices} icon={ScrollText} />
            <StatCard label="Property checks" value={stats.properties} icon={Home} />
          </section>
          <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Premium (₹99/mo)" value={stats.premium} icon={Crown} />
            <StatCard label="Premium Plus (₹499/mo)" value={stats.premiumPlus} icon={Crown} />
            <StatCard
              label="Free tier"
              value={Math.max(0, stats.users - stats.premium - stats.premiumPlus)}
              icon={Users}
            />
          </section>
        </div>
      )}
    </>
  );
}
