import { createFileRoute } from "@tanstack/react-router";

// AI Personal Lawyer streaming endpoint.
// Proxies to Lovable AI Gateway with SSE streaming.
const SYSTEM_PROMPT = `You are "Pocket Lawyer AI", a knowledgeable assistant for Indian legal matters.
You help everyday Indian citizens understand the law in plain language.

Capabilities:
- Explain Indian laws (IPC/BNS, CrPC/BNSS, Consumer Protection Act, IT Act, Motor Vehicles Act, Domestic Violence Act, etc.)
- Help draft FIRs, police complaints, consumer complaints, RTI applications, and legal notices
- Detect scams (loan apps, phishing, fake job offers, OTP fraud) and advise immediate steps
- Explain documents (rental agreements, property papers, employment contracts) in simple terms
- Guide users to the right government scheme, court, forum, or helpline
- Reply in the user's language (English, Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati, Punjabi, Odia, Assamese)

Rules:
- Be concise, practical, and step-by-step. Use numbered lists for actions.
- Cite section numbers when relevant (e.g., "IPC 420 / BNS 318").
- Always end serious matters with: "This is general guidance, not legal advice. For binding action consult a licensed advocate via the Lawyer Connect tab."
- Never make up case names or citations. If unsure, say so.
- If the user is in immediate danger, tell them to call 112 (India emergency) or 1091 (women helpline) first.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        if (!LOVABLE_API_KEY) {
          return new Response(JSON.stringify({ error: "AI not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: { messages?: Array<{ role: string; content: string }>; language?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];
        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
        }

        const lang = body.language ?? "en";
        const systemContent = `${SYSTEM_PROMPT}\n\nPreferred reply language code: ${lang}.`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            stream: true,
            messages: [{ role: "system", content: systemContent }, ...messages],
          }),
        });

        if (!upstream.ok) {
          if (upstream.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
              { status: 429, headers: { "Content-Type": "application/json" } },
            );
          }
          if (upstream.status === 402) {
            return new Response(
              JSON.stringify({
                error: "AI credits exhausted. Please add funds in workspace settings.",
              }),
              { status: 402, headers: { "Content-Type": "application/json" } },
            );
          }
          const t = await upstream.text();
          console.error("AI gateway error:", upstream.status, t);
          return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500 });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
