import { useState, useEffect, useCallback } from 'react';
import { supabase, getRedemptions, createRedemption } from '@/lib/supabase';
import type { CoinTransaction, Redemption } from '@/types';

export function useCoins(userId?: string) {
  const [coins, setCoins] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time coin updates
  useEffect(() => {
    if (!userId) return;

    // Initial load
    loadCoinsData();

    // Subscribe to profile changes
    const subscription = supabase
      .channel(`profile-coins:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      }, (payload) => {
        const newRecord = payload.new as Record<string, any>;
        setCoins(newRecord.coins || 0);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadCoinsData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single();

      if (profile) {
        const profileRecord = profile as Record<string, any>;
        setCoins(profileRecord.coins || 0);
      }

      // Get transactions
      const { data: txs } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txs) {
        setTransactions(txs as CoinTransaction[]);
      }

      // Get redemptions
      const reds = await getRedemptions(userId);
      setRedemptions(reds as Redemption[]);

    } catch (err) {
      console.error('Error loading coins data:', err);
      setError('Failed to load coins data');
    } finally {
      setLoading(false);
    }
  };

  const redeemCoins = useCallback(async (
    amount: number,
    method: 'paypal' | 'giftcard',
    paypalEmail?: string
  ) => {
    if (!userId) {
      setError('User not authenticated');
      return null;
    }

    if (coins < amount) {
      setError('Insufficient coins');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate USD value (1 coin = $0.01)
      const usdValue = amount * 0.01;

      const redemption = await createRedemption({
        user_id: userId,
        amount: usdValue,
        coins_used: amount,
        method,
        paypal_email: paypalEmail,
      });

      // Deduct coins
      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-ignore
        .update({ coins: coins - amount })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Reload data
      await loadCoinsData();

      return redemption;
    } catch (err) {
      console.error('Error redeeming coins:', err);
      setError('Failed to redeem coins');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, coins]);

  const getCoinValue = useCallback((coins: number) => {
    // 1 coin = $0.0001 (10,000 coins = $1)
    return (coins * 0.0001).toFixed(4);
  }, []);

  const getRedemptionOptions = useCallback(() => {
    // Sustainable model: 1 coin = $0.0001
    return [
      { coins: 1000, value: 0.10, label: '$0.10' },   // ~333 audio ads
      { coins: 2500, value: 0.25, label: '$0.25' },   // ~833 audio ads
      { coins: 5000, value: 0.50, label: '$0.50' },   // ~1667 audio ads
      { coins: 10000, value: 1.00, label: '$1.00' },  // ~3333 audio ads
    ];
  }, []);

  return {
    coins,
    transactions,
    redemptions,
    loading,
    error,
    redeemCoins,
    getCoinValue,
    getRedemptionOptions,
    refresh: loadCoinsData,
  };
}
