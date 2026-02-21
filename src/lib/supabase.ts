import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// These will be replaced with actual values during deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth Helpers
export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Database Helpers
export const getTracks = async (filters?: {
  genre?: string;
  mood?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('tracks')
    .select('*')
    .eq('active', true);
  
  if (filters?.genre) {
    query = query.eq('genre', filters.genre);
  }
  
  if (filters?.mood) {
    query = query.eq('mood', filters.mood);
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,artist.ilike.%${filters.search}%`);
  }
  
  query = query.order('created_at', { ascending: false });
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const getTrackById = async (id: string) => {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserCoins = async (userId: string, newCoins: number) => {
  // First get current coins
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', userId)
    .single();
  
  const currentCoins = (profile as any)?.coins || 0;
  
  const { data, error } = await supabase
    .from('profiles')
    // @ts-ignore
    .update({ 
      coins: currentCoins + newCoins,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const recordAdView = async (adView: {
  user_id: string;
  ad_id: string;
  track_id: string;
  completed: boolean;
  coins_earned: number;
}) => {
  const { data, error } = await supabase
    .from('ad_views')
    .insert([{
      ...adView,
      viewed_at: new Date().toISOString(),
      verified: true,
    }] as any)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createRedemption = async (redemption: {
  user_id: string;
  amount: number;
  coins_used: number;
  method: 'paypal' | 'giftcard';
  paypal_email?: string;
}) => {
  const { data, error } = await supabase
    .from('redemptions')
    .insert([{
      ...redemption,
      status: 'pending',
      requested_at: new Date().toISOString(),
    }] as any)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getRedemptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getActiveAd = async (type: 'audio' | 'video') => {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('type', type)
    .eq('active', true)
    .order('impressions', { ascending: true })
    .limit(1)
    .single();
  
  if (error) throw error;
  return data;
};

export const incrementAdImpressions = async (adId: string) => {
  const { error } = await supabase.rpc('increment_ad_impressions', {
    ad_id: adId,
  } as any);
  
  if (error) throw error;
};

// Real-time subscriptions
export const subscribeToProfile = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`profile:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${userId}`,
    }, callback)
    .subscribe();
};

export const subscribeToCoinUpdates = (userId: string, callback: (coins: number) => void) => {
  return supabase
    .channel(`coins:${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${userId}`,
    }, (payload) => {
      callback((payload.new as any).coins);
    })
    .subscribe();
};
