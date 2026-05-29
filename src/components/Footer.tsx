import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-16 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center shadow-gold">
                <Scale className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-lg font-semibold">Pocket Lawyer AI</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80">India</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Affordable legal guidance for every Indian citizen — in 10 languages, available 24/7,
              backed by verified advocates.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#modules" className="hover:text-foreground">Modules</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#lawyers" className="hover:text-foreground">Lawyers</a></li>
              <li><a href="#" className="hover:text-foreground">Android App</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground">Disclaimer</a></li>
              <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="gold-divider mb-6" />
        <div className="flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Pocket Lawyer AI. All rights reserved.</p>
          <p className="italic">AI guidance is informational only and does not replace licensed advocates.</p>
        </div>
      </div>
    </footer>
  );
}
