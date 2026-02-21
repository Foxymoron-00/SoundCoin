// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  coins: number;
  total_earned: number;
  created_at: string;
  last_login: string;
  streak_days: number;
  last_streak_date?: string;
  is_premium: boolean;
  premium_until?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  coins: number;
  total_earned: number;
  streak_days: number;
  is_premium: boolean;
}

// Music Types
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover_url?: string;
  audio_url: string;
  genre: string;
  mood: string;
  bpm?: number;
  tags: string[];
  plays: number;
  likes: number;
  created_at: string;
  is_ai_generated: boolean;
  source: 'pixabay' | 'freepd' | 'mixkit' | 'uploaded' | 'ai';
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  tracks: string[];
  created_by: string;
  is_smart: boolean;
  mood?: string;
  created_at: string;
}

// Ad Types
export interface Ad {
  id: string;
  type: 'audio' | 'video';
  title: string;
  content_url: string;
  duration: number;
  subtitle_text?: string;
  coin_reward: number;
  impressions: number;
  active: boolean;
  created_at: string;
}

export interface AdView {
  id: string;
  user_id: string;
  ad_id: string;
  track_id: string;
  viewed_at: string;
  completed: boolean;
  verified: boolean;
  coins_earned: number;
}

// Coin & Reward Types
export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'redeemed' | 'bonus' | 'referral';
  description: string;
  related_ad_id?: string;
  created_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  amount: number;
  coins_used: number;
  method: 'paypal' | 'giftcard';
  paypal_email?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
}

// Admin Types
export interface AdminSettings {
  id: string;
  owner_revenue_percent: number;
  coin_value_usd: number;
  min_redemption_coins: number;
  daily_coin_limit: number;
  ad_cooldown_seconds: number;
  paypal_sandbox: boolean;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_users_today: number;
  total_plays: number;
  total_ads_viewed: number;
  total_coins_earned: number;
  total_redeemed: number;
  pending_redemptions: number;
  revenue_balance: number;
}

// Player Types
export interface PlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  currentIndex: number;
  repeat: 'none' | 'all' | 'one';
  shuffle: boolean;
  adMode: 'audio' | 'video';
  isPlayingAd: boolean;
  currentAd: Ad | null;
}

// Focus Mode Types
export type FocusMode = 'focus' | 'study' | 'sleep' | 'workout' | 'chill';

export interface FocusSession {
  id: string;
  user_id: string;
  mode: FocusMode;
  started_at: string;
  ended_at?: string;
  tracks_played: number;
  coins_earned: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Search & Filter
export interface TrackFilter {
  genre?: string;
  mood?: string;
  bpm_min?: number;
  bpm_max?: number;
  duration_min?: number;
  duration_max?: number;
  search?: string;
  sort_by?: 'newest' | 'popular' | 'duration' | 'alphabetical';
}
