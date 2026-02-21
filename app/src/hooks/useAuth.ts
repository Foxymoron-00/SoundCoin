import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserProfile } from '@/lib/supabase';
import type { User, UserProfile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          await loadUserData(currentUser.id);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const profileData = await getUserProfile(userId);
      if (profileData) {
        const profileRecord = profileData as Record<string, any>;
        setProfile(profileData as UserProfile);
        setUser({
          id: userId,
          email: profileRecord.email || '',
          username: profileRecord.username || '',
          avatar_url: profileRecord.avatar_url,
          coins: profileRecord.coins || 0,
          total_earned: profileRecord.total_earned || 0,
          created_at: profileRecord.created_at || '',
          last_login: profileRecord.last_login || '',
          streak_days: profileRecord.streak_days || 0,
          last_streak_date: profileRecord.last_streak_date,
          is_premium: profileRecord.is_premium || false,
          premium_until: profileRecord.premium_until,
        } as User);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
  };
}
