import { createFileRoute } from "@tanstack/react-router";
import { requireSupabaseAuthRequest } from "@/integrations/supabase/require-auth-request";

type Kind = "document" | "scam" | "notice" | "property";

const SYSTEM = `You are a senior Indian legal analyst AI for Pocket Lawyer AI. You read documents, messages, legal notices and property papers written for Indian citizens and return STRUCTURED analysis.

Rules:
- Be accurate, neutral and grounded only in the provided text.
- Cite relevant Indian laws when applicable (IPC/BNS, CrPC/BNSS, IT Act 2000, Consumer Protection Act 2019, RBI guidelines, Transfer of Property Act 1882, Registration Act 1908, RERA 2016, etc.).
- Use the requested reply language code.
- If the text is insufficient, still return the structured fields with best-effort guidance and clearly note what is missing in 'missing_fields' or 'risks'.
- Never invent facts not present in the source. Mark assumptions clearly.`;

function toolForKind(kind: Kind) {
  const common = {
    summary: { type: "string", description: "Plain-language summary in the requested language (4-8 sentences)." },
  };
  if (kind === "document") {
    return {
      name: "document_analysis",
      description: "Explain a legal/financial document in plain language with clauses, risks, deadlines and actions.",
      parameters: {
        type: "object",
        properties: {
          ...common,
          clauses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                explanation: { type: "string" },
                importance: { type: "string", enum: ["low", "medium", "high"] },
              },
              required: ["title", "explanation", "importance"],
              additionalProperties: false,
            },
          },
          risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high"] },
                detail: { type: "string" },
              },
              required: ["label", "severity", "detail"],
              additionalProperties: false,
            },
          },
          deadlines: {
            type: "array",
            items: {
              type: "object",
              properties: {
                when: { type: "string", description: "Date or relative time as stated in the document." },
                what: { type: "string" },
              },
              required: ["when", "what"],
              additionalProperties: false,
            },
          },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["summary", "clauses", "risks", "deadlines", "actions"],
        additionalProperties: false,
      },
    };
  }
  if (kind === "scam") {
    return {
      name: "scam_analysis",
      description: "Assess whether a message (SMS/WhatsApp/email/screenshot text) is a scam.",
      parameters: {
        type: "object",
        properties: {
          ...common,
          scam_score: { type: "integer", minimum: 0, maximum: 100 },
          risk_level: { type: "string", enum: ["safe", "low", "medium", "high", "critical"] },
          indicators: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                detail: { type: "string" },
              },
              required: ["label", "detail"],
              additionalProperties: false,
            },
          },
          actions: { type: "array", items: { type: "string" } },
        },
        required: ["summary", "scam_score", "risk_level", "indicators", "actions"],
        additionalProperties: false,
      },
    };
  }
  if (kind === "notice") {
    return {
      name: "notice_review",
      description: "Review a legal notice and explain risk, urgency and recommended response.",
      parameters: {
        type: "object",
        properties: {
          ...common,
          risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
          urgency_score: { type: "integer", minimum: 0, maximum: 100 },
          deadlines: {
            type: "array",
            items: {
              type: "object",
              properties: { when: { type: "string" }, what: { type: "string" } },
              required: ["when", "what"],
              additionalProperties: false,
            },
          },
          recommended_response: { type: "string", description: "A draft reply / next-step plan in the requested language." },
        },
        required: ["summary", "risk_level", "urgency_score", "deadlines", "recommended_response"],
        additionalProperties: false,
      },
    };
  }
  // property
  return {
    name: "property_verification",
    description: "Verify property/registry/mutation/land documents and flag missing fields and risks.",
    parameters: {
      type: "object",
      properties: {
        ...common,
        ownership_checklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: { type: "string" },
              present: { type: "boolean" },
              note: { type: "string" },
            },
            required: ["item", "present", "note"],
            additionalProperties: false,
          },
        },
        missing_fields: { type: "array", items: { type: "string" } },
        risks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              severity: { type: "string", enum: ["low", "medium", "high"] },
              detail: { type: "string" },
            },
            required: ["label", "severity", "detail"],
            additionalProperties: false,
          },
        },
        guidance: { type: "string" },
      },
      required: ["summary", "ownership_checklist", "missing_fields", "risks", "guidance"],
      additionalProperties: false,
    },
  };
}

export const Route = createFileRoute("/api/analyze")({
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

        let body: { kind?: Kind; language?: string; text?: string; context?: Record<string, unknown> };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        const kind = (body.kind ?? "document") as Kind;
        const language = body.language ?? "en";
        const text = (body.text ?? "").trim();
        if (!text) {
          return new Response(JSON.stringify({ error: "Empty input text" }), { status: 400 });
        }
        if (text.length > 60000) {
          return new Response(JSON.stringify({ error: "Input too long (max 60,000 chars)" }), { status: 400 });
        }

        const tool = toolForKind(kind);
        const userPrompt = `Analyze the following ${kind} content for an Indian user. Reply language code: ${language}.${
          body.context ? `\n\nContext: ${JSON.stringify(body.context)}` : ""
        }\n\n--- BEGIN CONTENT ---\n${text}\n--- END CONTENT ---`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: userPrompt },
            ],
            tools: [{ type: "function", function: tool }],
            tool_choice: { type: "function", function: { name: tool.name } },
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
          return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 500 });
        }

        const json = await upstream.json();
        const call = json?.choices?.[0]?.message?.tool_calls?.[0];
        let parsed: Record<string, unknown> = {};
        try {
          parsed = call?.function?.arguments ? JSON.parse(call.function.arguments) : {};
        } catch {
          parsed = {};
        }

        return new Response(JSON.stringify({ kind, result: parsed, raw: call?.function?.arguments ?? "" }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
