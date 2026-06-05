
import { createFileRoute } from "@tanstack/react-router";

import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";

const GROQ_KEY = "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";

const SYSTEM = `You are "Pocket Lawyer AI", a knowledgeable assistant for Indian legal matters. Help Indian citizens understand the law in plain language. Reply in the user's language. Always end with: "This is general guidance, not legal advice."`;

export const Route = createFileRoute("/api/chat")({

  server: {

    middleware: [requireSupabaseAuthRequest],

    handlers: {

      POST: async ({ request }) => {

        let body: { messages?: Array<{ role: string; content: string }>; language?: string };

        try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

        const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];

        if (!messages.length) return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });

        const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {

          method: "POST",

          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },

          body: JSON.stringify({

            model: "llama-3.3-70b-versatile",

            stream: true,

            messages: [{ role: "system", content: `${SYSTEM}\nLanguage: ${body.language ?? "en"}` }, ...messages],

          }),

        });

        if (!upstream.ok) { const t = await upstream.text(); console.error("Groq error:", t); return new Response(JSON.stringify({ error: "AI error" }), { status: 500 }); }

        return new Response(upstream.body, {

          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },

        });

      },

    },

  },

});

