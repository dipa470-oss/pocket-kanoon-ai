import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  FileSearch,
  MessageSquare,
  Crown,
  Scale,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: Crown },
  { to: "/admin/complaints", label: "Complaints", icon: FileText },
  { to: "/admin/fir", label: "FIR drafts", icon: ShieldAlert },
  { to: "/admin/documents", label: "Doc analyses", icon: FileSearch },
  { to: "/admin/chats", label: "AI chats", icon: MessageSquare },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-hero text-foreground">
      <div className="flex">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/60 bg-background/50 backdrop-blur-xl min-h-screen sticky top-0">
          <div className="p-5 border-b border-border/60">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center shadow-gold">
                <Scale className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="leading-tight">
                <div className="font-display text-base font-semibold">Admin Console</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-primary/80">Pocket Lawyer</div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {NAV.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-accent/70 text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-border/60 space-y-0.5">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40"
            >
              <ArrowLeft className="w-4 h-4" />
              User app
            </Link>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-display font-semibold">Admin Console</span>
              <Link to="/dashboard" className="text-xs text-primary">
                User app
              </Link>
            </div>
            <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
              {NAV.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border whitespace-nowrap"
                  activeProps={{ className: "!border-primary text-primary" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </header>
          <main className="p-5 md:p-8 max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
