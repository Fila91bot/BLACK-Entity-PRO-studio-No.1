import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { incrementTokens } from '../supabase.js';

const router = express.Router();

// POST /api/video - Video generiranje (placeholder)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt required' });
  }

  try {
    // Povećaj tokens_used (preskoči za admina)
    if (!req.isAdmin && req.user) {
      await incrementTokens(req.user.id, 1);
    }

    // TODO: Implementiraj video generiranje
    // Opcije: Runway, Pika, Stability AI Video, ili OpenAI Sora (kada bude dostupan)
    
    res.status(501).json({ 
      error: 'Not implemented yet',
      message: 'Video generation coming soon! 🎬'
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    res.status(500).json({ 
      error: 'Video generation failed', 
      message: error.message 
    });
  }
});

export default router;
