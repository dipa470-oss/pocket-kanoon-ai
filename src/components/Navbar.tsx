import { Scale } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";

export function Navbar() {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center shadow-gold">
            <Scale className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold tracking-wide">Pocket Lawyer</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80 -mt-0.5">
              AI · India
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#modules" className="hover:text-foreground transition-colors">
            Modules
          </a>
          <a href="#how" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#lawyers" className="hover:text-foreground transition-colors">
            Lawyers
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                className="text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
