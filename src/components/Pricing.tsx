import { Check, Crown } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Try Pocket Lawyer AI risk-free.",
    features: ["5 AI questions per day", "Limited document analysis", "2 complaint drafts / month", "Emergency helplines", "Community access"],
    cta: "Start free",
  },
  {
    name: "Premium",
    price: "₹299",
    period: "per month",
    desc: "For citizens who want full protection.",
    features: ["Unlimited AI questions", "Unlimited complaints & FIRs", "Advanced document analysis", "Scam & notice checker", "Voice lawyer (all languages)", "Priority support"],
    cta: "Go Premium",
    highlight: true,
  },
  {
    name: "Premium Plus",
    price: "₹799",
    period: "per month",
    desc: "Everything in Premium, plus real advocates.",
    features: ["All Premium features", "4 lawyer consultation credits", "Video & audio consultations", "Case tracker & reminders", "Legal research engine", "Dedicated case manager"],
    cta: "Get Premium Plus",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Plans</p>
          <h2 className="font-display text-4xl md:text-5xl mb-4">
            Justice should be <span className="text-gradient-gold italic">affordable</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you need unlimited drafting, document analysis or a real advocate on call.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative p-8 rounded-2xl border transition-all ${
                p.highlight
                  ? "bg-gradient-to-b from-secondary/80 to-card border-primary/50 shadow-gold scale-[1.02]"
                  : "bg-card-elegant border-border hover:border-primary/30"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-br from-gold-soft to-gold text-primary-foreground text-xs font-semibold shadow-gold">
                  <Crown className="w-3.5 h-3.5" /> Most Popular
                </div>
              )}
              <h3 className="font-display text-2xl mb-1">{p.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-display text-5xl">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <button
                className={`w-full py-3 rounded-md font-medium transition-all ${
                  p.highlight
                    ? "bg-gradient-to-br from-gold-soft to-gold text-primary-foreground shadow-gold hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {p.cta}
              </button>
              <div className="gold-divider my-6" />
              <ul className="space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" strokeWidth={2.5} />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
