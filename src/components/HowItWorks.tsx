import { MessageCircle, FileCheck2, Gavel } from "lucide-react";

const steps = [
  { icon: MessageCircle, title: "Ask in your language", desc: "Type or speak your legal issue in any of 10 Indian languages. AI understands context, slang and regional terms." },
  { icon: FileCheck2, title: "Get instant guidance", desc: "Receive your rights, applicable laws, required documents, risks and a step-by-step plan — drafted on the spot." },
  { icon: Gavel, title: "Act with confidence", desc: "Generate complaints, file FIRs, verify documents — or escalate to a verified advocate via video, audio or chat." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-card/30 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">How it works</p>
          <h2 className="font-display text-4xl md:text-5xl">
            From doubt to <span className="text-gradient-gold italic">decisive action</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] gold-divider" />
          {steps.map((s, i) => (
            <div key={s.title} className="text-center relative">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-navy-deep border border-primary/30 flex items-center justify-center mb-6 shadow-elegant relative z-10">
                <s.icon className="w-9 h-9 text-primary" strokeWidth={1.5} />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-gold-soft to-gold text-primary-foreground text-xs font-bold flex items-center justify-center shadow-gold">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display text-2xl mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
