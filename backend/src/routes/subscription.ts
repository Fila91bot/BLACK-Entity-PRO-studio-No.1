import express from 'express';
import crypto from 'crypto';
import { supabase } from '../supabase.js';

const router = express.Router();

// POST /api/subscription/create - Kreiranje checkout linka
router.post('/create', async (req, res) => {
  try {
    const { userId, email } = req.body;

    // Lemon Squeezy checkout URL
    const productId = process.env.VITE_LEMONSQUEEZY_PRODUCT_ID || 'YOUR_PRODUCT_ID';
    const checkoutUrl = `https://YOUR-URL.com/checkout/buy/${productId}`;

    res.json({ 
      checkoutUrl,
      message: 'Redirect user to checkout' 
    });
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/subscription/webhook - Lemon Squeezy webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const body = req.body;

    // Verify signature (VAŽNO za sigurnost!)
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (secret) {
      const hmac = crypto.createHmac('sha256', secret);
      const rawBodyString = (req as any).rawBody || JSON.stringify(body);
      const digest = hmac.update(body as Buffer).digest('hex');
      
      if (signature !== digest) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = JSON.parse((body as Buffer).toString('utf-8'));
    const eventName = event.meta?.event_name;

    console.log('Webhook event:', eventName);

    // Handle subscription events
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const customerId = event.data?.attributes?.customer_id;
      const userEmail = event.data?.attributes?.user_email;
      const status = event.data?.attributes?.status;

      console.log('Subscription update:', { customerId, userEmail, status });

      // Pronađi korisnika po email-u
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (user) {
        // Ažuriraj subscription status
        const isActive = status === 'active' || status === 'on_trial';
        
        await supabase
          .from('users')
          .update({ 
            is_subscribed: isActive,
            suspicious: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user_id);

        console.log(`User ${userEmail} subscription updated to ${status}`);
      } else {
        console.warn(`User not found for email: ${userEmail}`);
      }
    }

    // Handle subscription cancellation
    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      const userEmail = event.data?.attributes?.user_email;

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({ 
            is_subscribed: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user_id);

        console.log(`User ${userEmail} subscription cancelled`);
      }
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/subscription/status - Provjeri subscription status
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('is_subscribed, tokens_used')
      .eq('user_id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      isSubscribed: user.is_subscribed,
      tokensUsed: user.tokens_used,
      limit: 20
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
