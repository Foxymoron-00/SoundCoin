-- SoundCoin Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  coins INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  streak_days INTEGER DEFAULT 0,
  last_streak_date DATE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRACKS TABLE
-- ============================================
CREATE TABLE tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER DEFAULT 0, -- in seconds
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  genre TEXT DEFAULT 'Unknown',
  mood TEXT DEFAULT 'Neutral',
  bpm INTEGER,
  tags TEXT[] DEFAULT '{}',
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'uploaded', -- 'pixabay', 'freepd', 'mixkit', 'uploaded', 'ai'
  active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_mood ON tracks(mood);
CREATE INDEX idx_tracks_active ON tracks(active);
CREATE INDEX idx_tracks_created ON tracks(created_at DESC);

-- Function to increment track plays
CREATE OR REPLACE FUNCTION increment_track_plays(track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks SET plays = plays + 1 WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADS TABLE
-- ============================================
CREATE TABLE ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('audio', 'video')),
  title TEXT NOT NULL,
  content_url TEXT NOT NULL,
  duration INTEGER DEFAULT 30, -- in seconds
  subtitle_text TEXT,
  coin_reward INTEGER DEFAULT 5,
  impressions INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to increment ad impressions
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads SET impressions = impressions + 1 WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AD VIEWS TABLE (for tracking and anti-fraud)
-- ============================================
CREATE TABLE ad_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  ad_id UUID REFERENCES ads(id) NOT NULL,
  track_id UUID REFERENCES tracks(id) NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  coins_earned INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_ad_views_user ON ad_views(user_id);
CREATE INDEX idx_ad_views_ad ON ad_views(ad_id);
CREATE INDEX idx_ad_views_viewed ON ad_views(viewed_at);

-- ============================================
-- COIN TRANSACTIONS TABLE
-- ============================================
CREATE TABLE coin_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount INTEGER NOT NULL, -- positive for earned, negative for redeemed
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'referral')),
  description TEXT,
  related_ad_id UUID REFERENCES ads(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON coin_transactions(user_id);
CREATE INDEX idx_transactions_created ON coin_transactions(created_at DESC);

-- ============================================
-- REDEMPTIONS TABLE
-- ============================================
CREATE TABLE redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- USD amount
  coins_used INTEGER NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('paypal', 'giftcard')),
  paypal_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id),
  notes TEXT
);

CREATE INDEX idx_redemptions_user ON redemptions(user_id);
CREATE INDEX idx_redemptions_status ON redemptions(status);

-- ============================================
-- PLAYLISTS TABLE
-- ============================================
CREATE TABLE playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  tracks UUID[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) NOT NULL,
  is_smart BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playlists_created_by ON playlists(created_by);
CREATE INDEX idx_playlists_public ON playlists(is_public);

-- ============================================
-- TRACK LIKES TABLE
-- ============================================
CREATE TABLE track_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  track_id UUID REFERENCES tracks(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(track_id, user_id)
);

-- ============================================
-- ADMIN SETTINGS TABLE
-- ============================================
CREATE TABLE admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_revenue_percent DECIMAL(5, 2) DEFAULT 30.00,
  coin_value_usd DECIMAL(10, 6) DEFAULT 0.000100,  -- 1 coin = $0.0001
  min_redemption_coins INTEGER DEFAULT 1000,        -- $0.10 minimum
  daily_coin_limit INTEGER DEFAULT 500,             -- ~$0.05 daily max
  ad_cooldown_seconds INTEGER DEFAULT 60,
  paypal_sandbox BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO admin_settings (id) VALUES (uuid_generate_v4()) ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tracks policies (public read)
CREATE POLICY "Tracks are viewable by everyone" ON tracks
  FOR SELECT USING (active = TRUE);

-- Ad views policies
CREATE POLICY "Users can view own ad views" ON ad_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create ad views" ON ad_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coin transactions policies
CREATE POLICY "Users can view own transactions" ON coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Redemptions policies
CREATE POLICY "Users can view own redemptions" ON redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions" ON redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Playlists policies
CREATE POLICY "Public playlists are viewable" ON playlists
  FOR SELECT USING (is_public = TRUE OR auth.uid() = created_by);

CREATE POLICY "Users can manage own playlists" ON playlists
  FOR ALL USING (auth.uid() = created_by);

-- Admin policies (for admin users)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Admins can manage tracks" ON tracks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Admins can manage ads" ON ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Admins can view all redemptions" ON redemptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Admins can manage settings" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND email LIKE '%admin%'
    )
  );

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE coin_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE redemptions;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample tracks (comment out in production)
/*
INSERT INTO tracks (title, artist, genre, mood, audio_url, duration) VALUES
  ('Ambient Dreams', 'SoundCoin Studio', 'Ambient', 'Calm', 'https://example.com/track1.mp3', 180),
  ('Focus Flow', 'SoundCoin Studio', 'Electronic', 'Focused', 'https://example.com/track2.mp3', 240),
  ('Deep Sleep', 'SoundCoin Studio', 'Ambient', 'Sleep', 'https://example.com/track3.mp3', 300),
  ('Energy Boost', 'SoundCoin Studio', 'Electronic', 'Energetic', 'https://example.com/track4.mp3', 200),
  ('Study Beats', 'SoundCoin Studio', 'Lo-Fi', 'Calm', 'https://example.com/track5.mp3', 220);

-- Sample ads (comment out in production)
INSERT INTO ads (type, title, content_url, coin_reward) VALUES
  ('audio', 'Sample Audio Ad', 'https://example.com/ad1.mp3', 5),
  ('video', 'Sample Video Ad', 'https://example.com/ad2.mp4', 10);
*/
