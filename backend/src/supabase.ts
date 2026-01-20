import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper funkcije
export async function getUserByAuthToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function getOrCreateUser(userId: string, email?: string) {
  // Provjeri postoji li korisnik
  let { data: dbUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Ako ne postoji, kreiraj
  if (!dbUser) {
    const { data: newUser } = await supabase
      .from('users')
      .insert({ 
        user_id: userId,
        email: email 
      })
      .select()
      .single();
    dbUser = newUser;
  }

  return dbUser;
}

export async function incrementTokens(userId: string, tokens: number = 1) {
  return await supabase.rpc('increment_tokens_used', { 
    user_id_input: userId, 
    tokens 
  });
}

export async function checkUserLimit(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('tokens_used, is_subscribed')
    .eq('user_id', userId)
    .single();

  if (!user) return { allowed: false, reason: 'User not found' };

  const FREE_LIMIT = 20;
  if (!user.is_subscribed && user.tokens_used >= FREE_LIMIT) {
    return { 
      allowed: false, 
      reason: 'Free limit reached',
      tokensUsed: user.tokens_used,
      limit: FREE_LIMIT
    };
  }

  return { allowed: true, user };
}
