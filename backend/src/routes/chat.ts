import express from 'express';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { incrementTokens } from '../supabase.js';

const router = express.Router();

// OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Groq client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

// POST /api/chat - Chat s AI modelima
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  try {
    // Povećaj tokens_used (preskoči za admina)
    if (!req.isAdmin && req.user) {
      await incrementTokens(req.user.id, 1);
    }

    // Odaberi provider na temelju modela
    const isGroqModel = model?.startsWith('llama') || 
                        model?.startsWith('mixtral') ||
                        model?.startsWith('gemma');

    let completion;

    if (isGroqModel) {
      // Groq streaming
      completion = await groq.chat.completions.create({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        stream: true,
      });
    } else {
      // OpenAI streaming
      completion = await openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages,
        stream: true,
      });
    }

    // Stream response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Chat failed', 
      message: error.message 
    });
  }
});

export default router;
