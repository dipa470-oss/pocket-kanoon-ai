import {
  MessageSquare, FileText, FileSearch, ShieldAlert, AlertTriangle,
  ScrollText, Home, Siren, Mic, PhoneCall, Archive, Crown,
  Users, Lock, Gavel, CalendarClock, FolderOpen, Landmark,
  BookOpen, BarChart3, BellRing, Languages, Briefcase, Building2,
} from "lucide-react";

const modules = [
  { icon: MessageSquare, title: "AI Personal Lawyer", desc: "24/7 chat on FIR, cyber crime, property, family, loans, consumer rights and more." },
  { icon: FileText, title: "Complaint Generator", desc: "Draft police, RBI, consumer, banking, and women-protection complaints in seconds." },
  { icon: FileSearch, title: "Document Explain AI", desc: "Upload loan papers, notices, agreements — get plain-language summaries & risks." },
  { icon: ShieldAlert, title: "Loan Harassment Shield", desc: "Detect illegal recovery tactics and auto-generate RBI & consumer complaints." },
  { icon: AlertTriangle, title: "Scam Detector AI", desc: "Analyse SMS, WhatsApp, email or call transcripts for fraud probability." },
  { icon: ScrollText, title: "Legal Notice Checker", desc: "Verify authenticity, urgency and recommended response for any notice." },
  { icon: Home, title: "Property Paper Verifier", desc: "Registry, mutation & land records analysed for missing info and red flags." },
  { icon: Siren, title: "FIR Assistant", desc: "State-wise FIR drafts, filing process, rights and document checklists." },
  { icon: Mic, title: "Voice Lawyer", desc: "Natural voice conversations in Hindi, Bengali, Tamil, Telugu and more." },
  { icon: PhoneCall, title: "Emergency Legal Help", desc: "One-tap access to police, cyber crime, women & consumer helplines." },
  { icon: Archive, title: "Case History Vault", desc: "Securely store documents, complaints, notices and chat history." },
  { icon: Gavel, title: "Human Lawyer Connect", desc: "Verified advocates, ratings, video/audio/chat consultations." },
  { icon: CalendarClock, title: "Court Case Tracker", desc: "Hearing reminders, case notes, document storage and notifications." },
  { icon: FolderOpen, title: "Legal Forms Library", desc: "Affidavits, rent agreements, POA, legal notices — PDF & DOCX export." },
  { icon: Landmark, title: "Government Scheme Assistant", desc: "Central & state schemes with eligibility checker and document guidance." },
  { icon: BookOpen, title: "AI Legal Research", desc: "Search Acts, rules, judgments — summarised in simple language." },
  { icon: BellRing, title: "Court Date Reminders", desc: "Push, email and calendar alerts so you never miss a hearing." },
  { icon: Languages, title: "Multi-Language Voice", desc: "English, Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati and more." },
  { icon: Briefcase, title: "Advocate Portal", desc: "Lawyer registration, verification, dashboard and earnings." },
  { icon: Users, title: "Community Q&A", desc: "Anonymous, moderated legal discussions and shared learning." },
  { icon: Lock, title: "Bank-Grade Security", desc: "End-to-end encryption, 2FA, private storage, role-based access." },
  { icon: Building2, title: "Admin Console", desc: "Users, subscriptions, revenue, support and lawyer management." },
  { icon: BarChart3, title: "Analytics Suite", desc: "Revenue, growth, retention and complaint analytics dashboards." },
  { icon: Crown, title: "Premium Subscriptions", desc: "Free, Premium and Premium Plus with consultation credits." },
];

export function Modules() {
  return (
    <section id="modules" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">The Platform</p>
          <h2 className="font-display text-4xl md:text-5xl mb-4">
            Twenty-four modules. <span className="text-gradient-gold italic">One pocket lawyer.</span>
          </h2>
          <p className="text-muted-foreground">
            Every legal need an Indian citizen faces — drafted, explained, defended and tracked by AI,
            with verified advocates one tap away.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((m, i) => (
            <div
              key={m.title}
              className="group relative p-6 rounded-xl bg-card-elegant border border-border hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-gold"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer pointer-events-none" />
              <div className="w-11 h-11 rounded-lg bg-secondary/60 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <m.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg mb-1.5">{m.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
