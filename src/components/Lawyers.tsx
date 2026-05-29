import { Video, MessageSquare, Phone, Star } from "lucide-react";

export function Lawyers() {
  return (
    <section id="lawyers" className="py-24 bg-card/30 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Human lawyer connect</p>
          <h2 className="font-display text-4xl md:text-5xl mb-6">
            When AI isn't enough, <br />
            <span className="text-gradient-gold italic">a real advocate is.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Browse verified advocates by state, practice area and rating. Book a video, audio or
            chat consultation in minutes — your case history is shared securely so you never repeat
            yourself.
          </p>

          <div className="flex flex-wrap gap-3">
            {[
              { icon: Video, label: "Video Call" },
              { icon: Phone, label: "Audio Call" },
              { icon: MessageSquare, label: "Chat" },
            ].map((m) => (
              <div key={m.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/60">
                <m.icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[
            { name: "Adv. Priya Sharma", area: "Consumer & Banking · Delhi", rating: 4.9, cases: 312 },
            { name: "Adv. Ravi Kulkarni", area: "Property & Civil · Mumbai", rating: 4.8, cases: 421 },
            { name: "Adv. Anjali Reddy", area: "Cyber Crime · Hyderabad", rating: 5.0, cases: 198 },
          ].map((l, i) => (
            <div
              key={l.name}
              className="p-5 rounded-xl bg-card-elegant border border-border flex items-center gap-4 hover:border-primary/40 transition-colors"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-navy-deep border border-primary/30 flex items-center justify-center font-display text-xl text-primary">
                {l.name.split(" ").pop()?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg leading-tight">{l.name}</div>
                <div className="text-xs text-muted-foreground truncate">{l.area}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                  <Star className="w-3.5 h-3.5 fill-primary" /> {l.rating}
                </div>
                <div className="text-[11px] text-muted-foreground">{l.cases} cases</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
