import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-hero">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-hero px-6">
        <div className="max-w-md text-center rounded-2xl border border-border/60 bg-card-elegant p-8">
          <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold mb-2">Admin access required</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your account does not have the <span className="text-primary font-medium">admin</span> role.
            Contact a platform administrator if you need access.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground text-sm font-medium"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
