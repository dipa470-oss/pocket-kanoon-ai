import { Link, useRouter } from "@tanstack/react-router";
import { Scale, LayoutDashboard, FileText, ShieldAlert, MessageSquare, FolderOpen, LogOut, FileSearch, ShieldCheck, Gavel, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "AI Lawyer", icon: MessageSquare },
  { to: "/complaints", label: "Complaints", icon: FileText },
  { to: "/fir", label: "FIR Drafts", icon: ShieldAlert },
  { to: "/explain", label: "Explain Doc", icon: FileSearch },
  { to: "/scam", label: "Scam Check", icon: ShieldCheck },
  { to: "/notice-check", label: "Notice Check", icon: Gavel },
  { to: "/property-verify", label: "Property", icon: Landmark },
  { to: "/documents", label: "Documents", icon: FolderOpen },
] as const;

export function DashboardShell({ children, title }: { children: ReactNode; title?: string }) {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-hero text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2 border-r border-border/60 bg-background/40 backdrop-blur-xl p-5 min-h-screen sticky top-0">
          <Link to="/" className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center shadow-gold">
              <Scale className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold">Pocket Lawyer</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80">AI · India</span>
            </div>
          </Link>
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              activeProps={{ className: "!text-foreground bg-accent/60 border border-border" }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border overflow-x-auto">
          <div className="flex gap-1 py-2 px-2 min-w-max">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] text-muted-foreground shrink-0"
                activeProps={{ className: "!text-primary" }}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <main className="flex-1 min-w-0 pb-24 md:pb-10">
          <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/60 px-5 md:px-8 py-4 flex items-center justify-between">
            <h1 className="font-display text-xl md:text-2xl font-semibold">{title ?? "Dashboard"}</h1>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Home</Link>
          </header>
          <div className="p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
