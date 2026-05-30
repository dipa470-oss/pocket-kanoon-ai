import { createFileRoute } from "@tanstack/react-router";
import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";

const COMPLAINT_SYSTEM = `You are a senior Indian legal drafter. Generate a professional, formal, ready-to-submit complaint letter or FIR draft based on the user's inputs.

Rules:
- Use proper Indian legal format with TO/FROM/SUBJECT/DATE blocks where appropriate.
- Cite relevant sections (IPC/BNS, CrPC/BNSS, Consumer Protection Act 2019, IT Act 2000, RBI guidelines, Banking Ombudsman, etc.) when applicable.
- Use clear, respectful, formal English (or the requested Indian language).
- Include a numbered "Facts of the Case" / "Sequence of Events" section.
- Include a clear "Prayer / Relief Sought" section at the end.
- Add placeholders like [Your Name], [Address], [Date] only when the user did not provide that field.
- Do NOT add any markdown code fences. Output plain text only.
- End with a signature block.`;

export const Route = createFileRoute("/api/generate")({
  server: {
    middleware: [requireSupabaseAuthRequest],
    handlers: {
      POST: async ({ request }) => {
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        if (!LOVABLE_API_KEY) {
          return new Response(JSON.stringify({ error: "AI not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: {
          kind?: "complaint" | "fir";
          subType?: string;
          language?: string;
          data?: Record<string, unknown>;
        };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        const kind = body.kind ?? "complaint";
        const subType = body.subType ?? "police";
        const lang = body.language ?? "en";
        const data = body.data ?? {};

        const userPrompt = `Draft a ${kind === "fir" ? "First Information Report (FIR)" : `${subType} complaint`} for an Indian citizen.

Reply language code: ${lang}.

User-provided details (JSON):
${JSON.stringify(data, null, 2)}

Produce the complete formal draft now.`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: COMPLAINT_SYSTEM },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!upstream.ok) {
          if (upstream.status === 429)
            return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
              status: 429,
              headers: { "Content-Type": "application/json" },
            });
          if (upstream.status === 402)
            return new Response(
              JSON.stringify({ error: "AI credits exhausted. Add funds in workspace settings." }),
              { status: 402, headers: { "Content-Type": "application/json" } },
            );
          const t = await upstream.text();
          console.error("AI gateway error:", upstream.status, t);
          return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 500 });
        }

        const json = await upstream.json();
        const content: string = json?.choices?.[0]?.message?.content ?? "";

        return new Response(JSON.stringify({ content }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
