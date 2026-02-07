import "dotenv/config";

import express from "express";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { incrementTokens } from "../supabase.js";

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

// Allowed models (stabilno)
const OPENAI_ALLOWED = new Set(["gpt-4o-mini", "gpt-4o"]);
const GROQ_ALLOWED = new Set(["llama-3.3-70b-versatile"]);
const MISTRAL_ALLOWED = new Set(["mistral-small-latest", "mistral-large-latest"]);

async function streamMistralToResponse(
  res: express.Response,
  model: string,
  messages: any[]
) {
  if (!MISTRAL_API_KEY) throw new Error("Missing MISTRAL_API_KEY");

  const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!r.ok || !r.body) {
    const t = await r.text().catch(() => "");
    throw new Error(`Mistral error ${r.status}: ${t}`);
  }

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (data === "[DONE]") return;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) res.write(delta);
      } catch {
        // ignore non-json
      }
    }
  }
}

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  // 1) Odredi provider + selectedModel PRIJE nego pošalješ bilo kakav header
  const isMistralModel = typeof model === "string" && model.startsWith("mistral-");
  const isGroqModel =
    typeof model === "string" &&
    (model.startsWith("llama") || model.startsWith("mixtral") || model.startsWith("gemma"));

  const selectedModel = isMistralModel
    ? (MISTRAL_ALLOWED.has(model) ? model : "mistral-small-latest")
    : isGroqModel
      ? (GROQ_ALLOWED.has(model) ? model : "llama-3.3-70b-versatile")
      : (OPENAI_ALLOWED.has(model) ? model : "gpt-4o-mini");

  console.log("MODEL USED:", selectedModel);
  
  try {
    // 2) Token counter (skip admin)
    if (!req.isAdmin && req.user) {
      await incrementTokens(req.user.id, 1);
    }

    // 3) Postavi headere PRIJE flush/write
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("x-model-used", selectedModel);

    // @ts-ignore
    res.flushHeaders?.();

    // 4) Stream po provideru
    if (isMistralModel) {
      await streamMistralToResponse(res, selectedModel, messages);
      return res.end();
    }

    if (isGroqModel) {
      const completion = await groq.chat.completions.create({
        model: selectedModel,
        messages,
        stream: true,
      });

      for await (const chunk of completion) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) res.write(content);
      }

      return res.end();
    }

    // OpenAI Responses
    const input = messages.map((m: any) => ({ role: m.role, content: m.content }));
    const completion = await openai.responses.stream({
      model: selectedModel,
      input,
    });

    for await (const event of completion) {
      if (event.type === "response.output_text.delta") {
        const delta = event.delta ?? "";
        if (delta) res.write(delta);
      }
    }

    return res.end();
  } catch (error: any) {
    console.error("Chat error:", error);

    // ✅ Ako je stream već krenuo, NE SMIJEŠ slati JSON/status — samo završi
    if (res.headersSent) {
      try {
        res.write(`\n\n⚠️ Server error: ${error?.message || String(error)}`);
      } catch {}
      return res.end();
    }

    // Ako stream nije krenuo, smiješ poslati JSON normalno
    return res.status(500).json({
      error: "Chat failed",
      message: error?.message || String(error),
    });
  }
});

export default router;
