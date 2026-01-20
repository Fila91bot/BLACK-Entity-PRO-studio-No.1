import express from 'express';
import OpenAI from 'openai';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { incrementTokens } from '../supabase.js';

const router = express.Router();

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// POST /api/image - Generiranje slika s DALL·E
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { prompt, model, size } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  try {
    // Povećaj tokens_used (preskoči za admina)
    if (!req.isAdmin && req.user) {
      await incrementTokens(req.user.id, 1);
    }

    const image = await openai.images.generate({
      model: model || 'dall-e-3',
      prompt,
      n: 1,
      size: size || '1024x1024',
    });

    res.json({ 
      imageUrl: image.data[0].url,
      prompt,
      model: model || 'dall-e-3'
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: 'Image generation failed', 
      message: error.message 
    });
  }
});

export default router;
