import { useState, useEffect } from 'react';
import {
  Users,
  Music,
  DollarSign,
  Upload,
  Settings,
  CheckCircle,
  XCircle,
  Headphones,
  Monitor,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { User, Track, Redemption, AdminSettings } from '@/types';

interface AdminPageProps {
  user: User;
}

export function AdminPage({ user }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTracks: 0,
    totalAds: 0,
    pendingRedemptions: 0,
    totalCoinsEarned: 0,
    totalPaidOut: 0,
  });
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload form states
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [trackMood, setTrackMood] = useState('');

  const [adFile, setAdFile] = useState<File | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adType, setAdType] = useState<'audio' | 'video'>('audio');
  const [adCoins, setAdCoins] = useState(5);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get stats
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: tracksCount } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true });

      const { count: adsCount } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get redemptions
      const { data: redemptionsData } = await supabase
        .from('redemptions')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(50);

      // Get tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Get ads
      const { data: adsData } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      // Get settings
      const { data: settingsData } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      setStats({
        totalUsers: usersCount || 0,
        totalTracks: tracksCount || 0,
        totalAds: adsCount || 0,
        pendingRedemptions: pendingCount || 0,
        totalCoinsEarned: 0,
        totalPaidOut: 0,
      });

      setRedemptions(redemptionsData as Redemption[] || []);
      setTracks(tracksData as Track[] || []);
      setAds(adsData || []);
      setSettings(settingsData as unknown as AdminSettings);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRedemption = async (redemptionId: string) => {
    try {
      await supabase
        .from('redemptions')
        // @ts-ignore
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
        })
        .eq('id', redemptionId);

      toast.success('Redemption approved');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to approve redemption');
    }
  };

  const handleRejectRedemption = async (redemptionId: string) => {
    try {
      await supabase
        .from('redemptions')
        // @ts-ignore
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
        })
        .eq('id', redemptionId);

      toast.success('Redemption rejected');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to reject redemption');
    }
  };

  const handleUploadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackFile || !trackTitle || !trackArtist) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Upload file to storage
      const fileExt = trackFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(fileName, trackFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('music')
        .getPublicUrl(fileName);

      // Create track record
      await supabase.from('tracks').insert([{
        title: trackTitle,
        artist: trackArtist,
        genre: trackGenre,
        mood: trackMood,
        audio_url: publicUrl,
        duration: 180,
        source: 'uploaded',
        is_ai_generated: false,
      }] as any);

      toast.success('Track uploaded successfully');
      setTrackFile(null);
      setTrackTitle('');
      setTrackArtist('');
      setTrackGenre('');
      setTrackMood('');
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to upload track');
    }
  };

  const handleUploadAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFile || !adTitle) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Upload file to storage
      const fileExt = adFile.name.split('.').pop();
      const fileName = `ad-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ads')
        .upload(fileName, adFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ads')
        .getPublicUrl(fileName);

      // Create ad record
      await supabase.from('ads').insert([{
        title: adTitle,
        type: adType,
        content_url: publicUrl,
        duration: 30,
        coin_reward: adCoins,
        active: true,
      }] as any);

      toast.success('Ad uploaded successfully');
      setAdFile(null);
      setAdTitle('');
      setAdCoins(5);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to upload ad');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF5A65]/20 border-t-[#FF5A65] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-white mb-2 font-['Fraunces']">
            Admin Dashboard
          </h1>
          <p className="text-white/60">Manage your music platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 mb-8">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#FF5A65]">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="data-[state=active]:bg-[#FF5A65]">
              <DollarSign className="w-4 h-4 mr-2" />
              Redemptions
            </TabsTrigger>
            <TabsTrigger value="tracks" className="data-[state=active]:bg-[#FF5A65]">
              <Music className="w-4 h-4 mr-2" />
              Tracks
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-[#FF5A65]">
              <Monitor className="w-4 h-4 mr-2" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#FF5A65]">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users },
                { label: 'Total Tracks', value: stats.totalTracks, icon: Music },
                { label: 'Active Ads', value: stats.totalAds, icon: Monitor },
                { label: 'Pending Redemptions', value: stats.pendingRedemptions, icon: DollarSign },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="w-6 h-6 text-[#FF5A65]" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setActiveTab('tracks')} className="btn-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Track
                </Button>
                <Button onClick={() => setActiveTab('ads')} className="btn-primary">
                  <Monitor className="w-4 h-4 mr-2" />
                  Add Ad
                </Button>
                <Button onClick={() => setActiveTab('redemptions')} variant="outline" className="border-white/20">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Review Redemptions
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Redemptions Tab */}
          <TabsContent value="redemptions">
            <div className="space-y-4">
              {redemptions.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No redemptions yet</p>
                </div>
              ) : (
                redemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="glass-card p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium">
                        ${redemption.amount.toFixed(2)} - {redemption.coins_used} coins
                      </p>
                      <p className="text-white/60 text-sm">
                        {redemption.paypal_email} •{' '}
                        {new Date(redemption.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {redemption.status === 'pending' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveRedemption(redemption.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRedemption(redemption.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge
                          variant="outline"
                          className={
                            redemption.status === 'approved'
                              ? 'bg-green-500/20 text-green-500'
                              : redemption.status === 'rejected'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }
                        >
                          {redemption.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tracks Tab */}
          <TabsContent value="tracks">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Form */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">Upload New Track</h3>
                <form onSubmit={handleUploadTrack} className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Audio File</label>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setTrackFile(e.target.files?.[0] || null)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Input
                    placeholder="Track Title"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Input
                    placeholder="Artist Name"
                    value={trackArtist}
                    onChange={(e) => setTrackArtist(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Genre"
                      value={trackGenre}
                      onChange={(e) => setTrackGenre(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Input
                      placeholder="Mood"
                      value={trackMood}
                      onChange={(e) => setTrackMood(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Track
                  </Button>
                </form>
              </div>

              {/* Track List */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">Recent Tracks</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                        <Music className="w-5 h-5 text-white/40" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{track.title}</p>
                        <p className="text-white/60 text-xs">{track.artist}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {track.plays} plays
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Form */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">Upload New Ad</h3>
                <form onSubmit={handleUploadAd} className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Ad File</label>
                    <Input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => setAdFile(e.target.files?.[0] || null)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Input
                    placeholder="Ad Title"
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={adType}
                      onChange={(e) => setAdType(e.target.value as 'audio' | 'video')}
                      className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2"
                    >
                      <option value="audio">Audio Ad</option>
                      <option value="video">Video Ad</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Coin Reward"
                      value={adCoins}
                      onChange={(e) => setAdCoins(Number(e.target.value))}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Ad
                  </Button>
                </form>
              </div>

              {/* Ad List */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">Active Ads</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {ads.map((ad: any) => (
                    <div
                      key={ad.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                        {ad.type === 'audio' ? (
                          <Headphones className="w-5 h-5 text-white/40" />
                        ) : (
                          <Monitor className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{ad.title}</p>
                        <p className="text-white/60 text-xs">
                          {ad.type} • {ad.coin_reward} coins
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={ad.active ? 'text-green-500' : 'text-red-500'}
                      >
                        {ad.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="glass-card p-6 max-w-2xl">
              <h3 className="text-lg font-medium text-white mb-4">Platform Settings</h3>
              {settings && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">
                      Owner Revenue Percentage
                    </label>
                    <Input
                      type="number"
                      defaultValue={settings.owner_revenue_percent}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-white/40 mt-1">
                      Percentage of ad revenue kept by platform
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">
                      Coin Value (USD)
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      defaultValue={settings.coin_value_usd}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">
                      Minimum Redemption (coins)
                    </label>
                    <Input
                      type="number"
                      defaultValue={settings.min_redemption_coins}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">
                      Daily Coin Limit
                    </label>
                    <Input
                      type="number"
                      defaultValue={settings.daily_coin_limit}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <Button className="btn-primary">Save Settings</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
