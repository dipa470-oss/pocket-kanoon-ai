
import { createFileRoute } from "@tanstack/react-router";

import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";

const GROQ_KEY = "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";

const SYSTEM = `You are a senior Indian legal analyst. Analyze documents and provide: summary, key points, risks, recommendations, and applicable Indian laws.`;

export const Route = createFileRoute("/api/analyze")({

  server: {

    middleware: [requireSupabaseAuthRequest],

    handlers: {

      POST: async ({ request }) => {

        let body: { text?: string; language?: string };

        try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

        if (!body.text) return new Response(JSON.stringify({ error: "text required" }), { status: 400 });

        const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {

          method: "POST",

          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },

          body: JSON.stringify({

            model: "llama-3.3-70b-versatile",

            messages: [{ role: "system", content: SYSTEM }, { role: "user", content: `Analyze in ${body.language ?? "en"}:\n\n${body.text}` }],

          }),

        });

        if (!upstream.ok) { const t = await upstream.text(); console.error("Groq error:", t); return new Response(JSON.stringify({ error: "AI error" }), { status: 500 }); }

        const json = await upstream.json();

        const content = json.choices?.[0]?.message?.content ?? "";

        return new Response(JSON.stringify({ content }), { headers: { "Content-Type": "application/json" } });

      },

    },

  },

});

