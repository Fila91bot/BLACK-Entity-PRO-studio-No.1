import express from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { incrementTokens } from "../supabase.js";

const router = express.Router();

const API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_AI_API_KEY;

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

// Veo model (možeš promijeniti kasnije)
const DEFAULT_MODEL = "veo-3.1-generate-preview";

// Koliko dugo ćemo server-side čekati da video postane ready
const MAX_WAIT_MS = 180_000; // 3 min
const POLL_EVERY_MS = 2_000;

function assertApiKey(): string {
  if (!API_KEY) {
    throw new Error(
      "Missing GEMINI_API_KEY (or GOOGLE_API_KEY/GOOGLE_AI_API_KEY) in environment variables"
    );
  }
  return API_KEY;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getBaseUrl(req: express.Request) {
  const proto =
    (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
  const host = req.get("host");
  return `${proto}://${host}`;
}

type VeoOperation = {
  name?: string;
  done?: boolean;
  response?: {
    generateVideoResponse?: {
      generatedSamples?: Array<{
        video?: { uri?: string };
      }>;
    };
  };
  error?: unknown;
};

async function startVeoOperation(opts: {
  prompt: string;
  model?: string;
  aspectRatio?: string; // "16:9" | "9:16"
  resolution?: string;  // "720p" | "1080p" | ...
}) {
  const key = assertApiKey();
  const model = opts.model || DEFAULT_MODEL;

  const body = {
    instances: [{ prompt: opts.prompt }],
    parameters: {
      ...(opts.aspectRatio ? { aspectRatio: opts.aspectRatio } : {}),
      ...(opts.resolution ? { resolution: opts.resolution } : {}),
    },
  };

  const resp = await fetch(`${BASE_URL}/models/${model}:predictLongRunning`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify(body),
  });

  const json = (await resp.json()) as any;

  if (!resp.ok) {
    const msg = json?.error?.message || "Veo request failed";
    throw new Error(`${resp.status} ${msg}`);
  }

  const name = json?.name as string | undefined;
  if (!name) {
    throw new Error("Veo did not return an operation name");
  }

  return { operationName: name, model };
}

async function getOperation(operationName: string): Promise<VeoOperation> {
  const key = assertApiKey();

  const resp = await fetch(`${BASE_URL}/${operationName}`, {
    headers: { "x-goog-api-key": key },
  });

  const json = (await resp.json()) as VeoOperation | any;

  if (!resp.ok) {
    const msg = json?.error?.message || "Failed to fetch operation status";
    throw new Error(`${resp.status} ${msg}`);
  }

  return json as VeoOperation;
}

function extractVideoUri(op: VeoOperation): string | null {
  const uri =
    op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  return uri || null;
}

async function waitForVideoUri(operationName: string): Promise<string | null> {
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    const op = await getOperation(operationName);

    if (op.done) {
      return extractVideoUri(op);
    }

    await sleep(POLL_EVERY_MS);
  }

  return null;
}

async function downloadVideoStream(videoUri: string) {
  const key = assertApiKey();

  const resp = await fetch(videoUri, {
    headers: { "x-goog-api-key": key },
    redirect: "follow",
  });

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `Failed to download video (${resp.status}). ${text || "No details"}`
    );
  }

  return resp;
}

/**
 * POST /api/video
 * Body: { prompt, model?, aspectRatio?, resolution? }
 * Returns: { videoUrl, operationName, model }
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { prompt, model, aspectRatio, resolution } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    // accounting (ti kasnije možeš brojati sekunde/credits)
    if (!req.isAdmin && req.user) {
      await incrementTokens(req.user.id, 1);
    }

    const { operationName, model: usedModel } = await startVeoOperation({
      prompt,
      model,
      aspectRatio,
      resolution,
    });

    const videoUri = await waitForVideoUri(operationName);

    const baseUrl = getBaseUrl(req);
    const proxyUrl = `${baseUrl}/api/video/result?name=${encodeURIComponent(
      operationName
    )}`;

    // Ako je gotov u okviru čekanja → vraćamo odmah "videoUrl"
    if (videoUri) {
      return res.json({
        videoUrl: proxyUrl, // proxy MP4 endpoint
        operationName,
        model: usedModel,
      });
    }

    // Ako nije stigao → ipak vraćamo proxy URL + operationName (i dalje "radi", samo treba retry)
    return res.status(202).json({
      message: "Video is still generating. Use videoUrl to download when ready.",
      videoUrl: proxyUrl,
      operationName,
      model: usedModel,
    });
  } catch (error: any) {
    console.error("Video generation error:", error);
    return res.status(500).json({
      error: "Video generation failed",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/video/result?name=operations/...
 * Streams MP4 when ready. If not ready yet, it waits (same MAX_WAIT_MS).
 */
router.get("/result", requireAuth, async (req: AuthRequest, res) => {
  const name = String(req.query.name || "");

  if (!name) {
    return res.status(400).json({ error: "name query param required" });
  }

  try {
    const operationName = decodeURIComponent(name);
    const videoUri = await waitForVideoUri(operationName);

    if (!videoUri) {
      return res.status(425).json({
        error: "Video not ready yet",
        message: "Try again in a bit (still generating).",
      });
    }

    const videoResp = await downloadVideoStream(videoUri);

    if (!videoResp.body) {
      return res.status(502).json({
        error: "Video download failed",
        message: "No response body returned from provider.",
      });
    }

   res.setHeader("Content-Type", "video/mp4");
   res.setHeader("Content-Disposition", `inline; filename="black-entity-video.mp4"`);

    const reader = videoResp.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (error: any) {
    console.error("Video result error:", error);
    return res.status(500).json({
      error: "Video result failed",
      message: error?.message || String(error),
    });
  }
});

export default router;

