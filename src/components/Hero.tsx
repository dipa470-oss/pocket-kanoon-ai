import heroImg from "@/assets/hero-justice.jpg";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-hero">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Scales of justice with Indian heritage motif"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs uppercase tracking-[0.2em] text-primary mb-8 animate-fade-up">
          <Sparkles className="w-3.5 h-3.5" />
          AI Legal Assistant · 10 Indian Languages
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.05] mb-6 animate-fade-up">
          Your Personal Lawyer
          <br />
          <span className="text-gradient-gold italic">Anytime, Anywhere</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 animate-fade-up">
          Affordable, instant legal guidance for every Indian citizen. From FIR drafts and loan
          harassment protection to verified advocate consultations — all in your pocket.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
          <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-gradient-to-br from-gold-soft to-gold text-primary-foreground font-medium shadow-gold hover:shadow-[0_15px_50px_-10px_oklch(0.78_0.13_85/50%)] transition-all">
            Ask your first legal question
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-card transition-colors">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Talk to a verified advocate
          </button>
        </div>

        <p className="mt-10 text-xs text-muted-foreground/70 italic max-w-xl mx-auto">
          AI guidance is informational only and does not replace licensed advocates.
        </p>
      </div>
    </section>
  );
}
