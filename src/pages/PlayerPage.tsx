import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ListMusic,
  Heart,
  Share2,
  Coins,
  Monitor,
  Headphones,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { usePlayer } from '@/hooks/usePlayer';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import type { User, FocusMode } from '@/types';

interface PlayerPageProps {
  user?: User | null;
}

export function PlayerPage({ user }: PlayerPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { getFocusPlaylist } = useMusicLibrary();
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    currentIndex,
    repeat,
    shuffle,
    adMode,
    isPlayingAd,
    currentAd,
    coinsEarned,
    playTrack,
    togglePlay,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setAdMode,
  } = usePlayer(user?.id);

  const [showQueue, setShowQueue] = useState(false);
  const [focusMode, setFocusMode] = useState<FocusMode | null>(
    location.state?.focusMode || null
  );
  const progressRef = useRef<HTMLDivElement>(null);

  // Load focus mode playlist
  useEffect(() => {
    if (focusMode) {
      loadFocusPlaylist();
    }
  }, [focusMode]);

  const loadFocusPlaylist = async () => {
    const tracks = await getFocusPlaylist(focusMode as any);
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
      toast.success(`${focusMode} mode activated`);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAdModeChange = (checked: boolean) => {
    setAdMode(checked ? 'video' : 'audio');
    toast.info(`Switched to ${checked ? 'video' : 'audio'} ad mode`);
  };

  return (
    <div className="min-h-screen pt-20 pb-8 flex flex-col">
      {/* Ad Overlay */}
      {isPlayingAd && currentAd && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          {adMode === 'video' ? (
            <>
              <video
                src={currentAd.content_url}
                autoPlay
                muted
                className="max-w-4xl max-h-[70vh] rounded-lg"
              />
              {currentAd.subtitle_text && (
                <div className="mt-8 text-center">
                  <p className="text-white text-xl">{currentAd.subtitle_text}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full gradient-bg flex items-center justify-center mb-8 animate-pulse">
                <Headphones className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-2xl text-white mb-4">Audio Advertisement</h3>
              <p className="text-white/60">Please listen to earn coins</p>
            </div>
          )}
          <div className="mt-8 flex items-center gap-2 text-[#FF5A65]">
            <Coins className="w-5 h-5" />
            <span>+{adMode === 'video' ? '3' : '1'} SoundCoins after this ad</span>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-3 gap-8 h-full">
          {/* Main Player */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Track Info */}
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              {currentTrack ? (
                <>
                  {/* Cover Art */}
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mb-8">
                    <div className="absolute inset-0 gradient-bg rounded-3xl blur-3xl opacity-30 animate-pulse" />
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                      {currentTrack.cover_url ? (
                        <img
                          src={currentTrack.cover_url}
                          alt={currentTrack.title}
                          className={`w-full h-full object-cover transition-transform duration-700 ${
                            isPlaying ? 'scale-105' : 'scale-100'
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <ListMusic className="w-24 h-24 text-white/20" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Track Details */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-medium text-white mb-2 font-['Fraunces']">
                      {currentTrack.title}
                    </h2>
                    <p className="text-lg text-white/60">{currentTrack.artist}</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Badge variant="outline" className="border-white/20">
                        {currentTrack.genre}
                      </Badge>
                      <Badge variant="outline" className="border-white/20">
                        {currentTrack.mood}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-white/5 flex items-center justify-center mb-8">
                    <ListMusic className="w-24 h-24 text-white/20" />
                  </div>
                  <h2 className="text-2xl text-white mb-2">No track playing</h2>
                  <p className="text-white/60 mb-6">Select a track from the library</p>
                  <Button onClick={() => navigate('/library')} className="btn-primary">
                    Browse Library
                  </Button>
                </div>
              )}
            </div>

            {/* Player Controls */}
            {currentTrack && (
              <div className="glass-card p-6">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div
                    ref={progressRef}
                    className="h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="h-full gradient-bg rounded-full transition-all duration-100"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-white/40">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={toggleShuffle}
                    className={`p-3 rounded-full transition-colors ${
                      shuffle ? 'text-[#FF5A65] bg-[#FF5A65]/10' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>

                  <button
                    onClick={skipPrevious}
                    className="p-3 rounded-full text-white hover:bg-white/10 transition-colors"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-[#FF5A65]/30"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </button>

                  <button
                    onClick={skipNext}
                    className="p-3 rounded-full text-white hover:bg-white/10 transition-colors"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>

                  <button
                    onClick={toggleRepeat}
                    className={`p-3 rounded-full transition-colors ${
                      repeat !== 'none'
                        ? 'text-[#FF5A65] bg-[#FF5A65]/10'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume & Extras */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleMute}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <Slider
                      value={[isMuted ? 0 : volume * 100]}
                      onValueChange={(v) => setVolume(v[0] / 100)}
                      max={100}
                      step={1}
                      className="w-24"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="text-white/60 hover:text-[#FF5A65] transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="text-white/60 hover:text-white transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowQueue(!showQueue)}
                      className={`text-white/60 hover:text-white transition-colors ${
                        showQueue ? 'text-[#FF5A65]' : ''
                      }`}
                    >
                      <ListMusic className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Coins Card */}
            {user && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Your Balance</h3>
                  <Coins className="w-5 h-5 text-[#FF5A65]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold gradient-text">
                    {(user.coins + coinsEarned).toLocaleString()}
                  </span>
                  <span className="text-white/60">SoundCoins</span>
                </div>
                {coinsEarned > 0 && (
                  <p className="text-sm text-[#FF5A65] mt-2">
                    +{coinsEarned} SoundCoins this session
                  </p>
                )}
                <Button
                  onClick={() => navigate('/rewards')}
                  className="w-full mt-4 btn-primary"
                >
                  Redeem Coins
                </Button>
              </div>
            )}

            {/* Ad Mode Toggle */}
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">Ad Mode</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-white/60" />
                  <span className="text-white/60">Audio</span>
                </div>
                <Switch
                  checked={adMode === 'video'}
                  onCheckedChange={handleAdModeChange}
                />
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-white/60" />
                  <span className="text-white/60">Video</span>
                </div>
              </div>
              <p className="text-xs text-white/40 mt-3">
                Video ads earn 3x SoundCoins (3 vs 1) but require screen attention
              </p>
            </div>

            {/* Focus Modes */}
            <div className="glass-card p-6">
              <h3 className="text-white font-medium mb-4">Focus Modes</h3>
              <div className="space-y-2">
                {[
                  { name: 'Focus', icon: '🎯', color: '#FF5A65' },
                  { name: 'Study', icon: '📚', color: '#4ECDC4' },
                  { name: 'Sleep', icon: '🌙', color: '#A78BFA' },
                  { name: 'Workout', icon: '💪', color: '#F59E0B' },
                ].map((mode) => (
                  <button
                    key={mode.name}
                    onClick={() => setFocusMode(mode.name.toLowerCase() as FocusMode)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      focusMode === mode.name.toLowerCase()
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-2xl">{mode.icon}</span>
                    <span className="text-white">{mode.name}</span>
                    {focusMode === mode.name.toLowerCase() && (
                      <div
                        className="ml-auto w-2 h-2 rounded-full"
                        style={{ backgroundColor: mode.color }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue */}
            {showQueue && queue.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Up Next</h3>
                  <button
                    onClick={() => setShowQueue(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {queue.slice(currentIndex + 1).map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                      onClick={() => playTrack(track, queue, currentIndex + 1 + index)}
                    >
                      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                        <ListMusic className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{track.title}</p>
                        <p className="text-white/40 text-xs truncate">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
