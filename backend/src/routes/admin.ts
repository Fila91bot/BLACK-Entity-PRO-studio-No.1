import express from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { supabase } from '../supabase.js';

const router = express.Router();

// Svi admin routeovi zahtijevaju autentifikaciju
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/stats - Admin dashboard statistike
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    // Dohvati sve korisnike
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Izračunaj statistike
    const totalUsers = users?.length || 0;
    const subscribedUsers = users?.filter(u => u.is_subscribed).length || 0;
    const freeUsers = totalUsers - subscribedUsers;
    const suspiciousUsers = users?.filter(u => u.suspicious).length || 0;
    const totalTokensUsed = users?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;

    // Korisnici s više od 1000 poruka u zadnjih 24h
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const flaggedUsers = users?.filter(u => {
      if (!u.last_token_reset || !u.tokens_used_24h) return false;
      const lastReset = new Date(u.last_token_reset);
      return lastReset > yesterday && u.tokens_used_24h > 1000;
    }) || [];

    // Top korisnici po broju poruka
    const topUsers = users
      ?.sort((a, b) => (b.tokens_used || 0) - (a.tokens_used || 0))
      .slice(0, 10)
      .map(u => ({
        user_id: u.user_id,
        email: u.email,
        tokens_used: u.tokens_used,
        is_subscribed: u.is_subscribed
      })) || [];

    res.json({
      overview: {
        total_users: totalUsers,
        subscribed_users: subscribedUsers,
        free_users: freeUsers,
        suspicious_users: suspiciousUsers,
        total_tokens_used: totalTokensUsed,
        avg_tokens_per_user: totalUsers > 0 ? Math.round(totalTokensUsed / totalUsers) : 0
      },
      flagged_users: flaggedUsers.map(u => ({
        user_id: u.user_id,
        email: u.email,
        tokens_used_24h: u.tokens_used_24h,
        last_token_reset: u.last_token_reset
      })),
      top_users: topUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users - Lista svih korisnika
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/user/:id - Detalji o korisniku
router.get('/user/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Dohvati poruke korisnika (zadnjih 50)
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    res.json({ 
      user,
      recent_messages: messages || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/user/:id - Ažuriraj korisnika
router.patch('/user/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { tokens_used, suspicious, is_subscribed } = req.body;

    const updateData: any = {};
    if (tokens_used !== undefined) updateData.tokens_used = tokens_used;
    if (suspicious !== undefined) updateData.suspicious = suspicious;
    if (is_subscribed !== undefined) updateData.is_subscribed = is_subscribed;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      user: data,
      message: 'User updated successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/user/:id - Obriši korisnika
router.delete('/user/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/reset-tokens/:id - Resetiraj token brojač
router.post('/reset-tokens/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({ 
        tokens_used: 0,
        tokens_used_24h: 0,
        last_token_reset: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      user: data,
      message: 'Tokens reset successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
