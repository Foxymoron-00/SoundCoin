export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          coins: number
          total_earned: number
          created_at: string
          last_login: string
          streak_days: number
          last_streak_date: string | null
          is_premium: boolean
          premium_until: string | null
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string | null
          coins?: number
          total_earned?: number
          created_at?: string
          last_login?: string
          streak_days?: number
          last_streak_date?: string | null
          is_premium?: boolean
          premium_until?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          coins?: number
          total_earned?: number
          created_at?: string
          last_login?: string
          streak_days?: number
          last_streak_date?: string | null
          is_premium?: boolean
          premium_until?: string | null
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          title: string
          artist: string
          album: string | null
          duration: number
          cover_url: string | null
          audio_url: string
          genre: string
          mood: string
          bpm: number | null
          tags: string[]
          plays: number
          likes: number
          created_at: string
          is_ai_generated: boolean
          source: string
          active: boolean
        }
        Insert: {
          id?: string
          title: string
          artist: string
          album?: string | null
          duration?: number
          cover_url?: string | null
          audio_url: string
          genre: string
          mood: string
          bpm?: number | null
          tags?: string[]
          plays?: number
          likes?: number
          created_at?: string
          is_ai_generated?: boolean
          source: string
          active?: boolean
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          album?: string | null
          duration?: number
          cover_url?: string | null
          audio_url?: string
          genre?: string
          mood?: string
          bpm?: number | null
          tags?: string[]
          plays?: number
          likes?: number
          created_at?: string
          is_ai_generated?: boolean
          source?: string
          active?: boolean
        }
      }
      ads: {
        Row: {
          id: string
          type: 'audio' | 'video'
          title: string
          content_url: string
          duration: number
          subtitle_text: string | null
          coin_reward: number
          impressions: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: 'audio' | 'video'
          title: string
          content_url: string
          duration?: number
          subtitle_text?: string | null
          coin_reward?: number
          impressions?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'audio' | 'video'
          title?: string
          content_url?: string
          duration?: number
          subtitle_text?: string | null
          coin_reward?: number
          impressions?: number
          active?: boolean
          created_at?: string
        }
      }
      ad_views: {
        Row: {
          id: string
          user_id: string
          ad_id: string
          track_id: string
          viewed_at: string
          completed: boolean
          verified: boolean
          coins_earned: number
        }
        Insert: {
          id?: string
          user_id: string
          ad_id: string
          track_id: string
          viewed_at?: string
          completed?: boolean
          verified?: boolean
          coins_earned?: number
        }
        Update: {
          id?: string
          user_id?: string
          ad_id?: string
          track_id?: string
          viewed_at?: string
          completed?: boolean
          verified?: boolean
          coins_earned?: number
        }
      }
      coin_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string
          related_ad_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description: string
          related_ad_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string
          related_ad_id?: string | null
          created_at?: string
        }
      }
      redemptions: {
        Row: {
          id: string
          user_id: string
          amount: number
          coins_used: number
          method: 'paypal' | 'giftcard'
          paypal_email: string | null
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          requested_at: string
          processed_at: string | null
          processed_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          coins_used: number
          method: 'paypal' | 'giftcard'
          paypal_email?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          requested_at?: string
          processed_at?: string | null
          processed_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          coins_used?: number
          method?: 'paypal' | 'giftcard'
          paypal_email?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          requested_at?: string
          processed_at?: string | null
          processed_by?: string | null
          notes?: string | null
        }
      }
      playlists: {
        Row: {
          id: string
          name: string
          description: string | null
          cover_url: string | null
          tracks: string[]
          created_by: string
          is_smart: boolean
          is_public: boolean
          mood: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cover_url?: string | null
          tracks?: string[]
          created_by: string
          is_smart?: boolean
          is_public?: boolean
          mood?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          cover_url?: string | null
          tracks?: string[]
          created_by?: string
          is_smart?: boolean
          is_public?: boolean
          mood?: string | null
          created_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          owner_revenue_percent: number
          coin_value_usd: number
          min_redemption_coins: number
          daily_coin_limit: number
          ad_cooldown_seconds: number
          paypal_sandbox: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          owner_revenue_percent?: number
          coin_value_usd?: number
          min_redemption_coins?: number
          daily_coin_limit?: number
          ad_cooldown_seconds?: number
          paypal_sandbox?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          owner_revenue_percent?: number
          coin_value_usd?: number
          min_redemption_coins?: number
          daily_coin_limit?: number
          ad_cooldown_seconds?: number
          paypal_sandbox?: boolean
          updated_at?: string
        }
      }
    }
    Functions: {
      increment_track_plays: {
        Args: { track_id: string }
        Returns: void
      }
      increment_ad_impressions: {
        Args: { ad_id: string }
        Returns: void
      }
    }
  }
}
