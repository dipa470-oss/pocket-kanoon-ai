import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Modules } from "@/components/Modules";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { Lawyers } from "@/components/Lawyers";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pocket Lawyer AI — Your Personal Lawyer, Anytime, Anywhere" },
      {
        name: "description",
        content:
          "AI-powered legal assistant for India. 24/7 guidance, complaint generation, document analysis, scam detection and verified advocate consultations in 10 Indian languages.",
      },
      { property: "og:title", content: "Pocket Lawyer AI — Personal Legal Assistant for India" },
      { property: "og:description", content: "Affordable, instant legal guidance in 10 Indian languages, plus verified advocates on call." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Modules />
        <HowItWorks />
        <Pricing />
        <Lawyers />
      </main>
      <Footer />
    </div>
  );
}
