import { useState, useRef, useCallback, useEffect } from 'react';
import type { Track, PlayerState } from '@/types';
import { getActiveAd, recordAdView, incrementAdImpressions, updateUserCoins } from '@/lib/supabase';

// Sustainable coin economics:
// 1 coin = $0.0001 (10,000 coins = $1)
// Audio ad: 1 coin, Video ad: 2-3 coins
// Based on typical ad CPM: $1-4 audio, $3-10 video
const AD_INTERVAL_TRACKS = 3;
const COINS_PER_AD_AUDIO = 1;
const COINS_PER_AD_VIDEO = 3;

export function usePlayer(userId?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    queue: [],
    currentIndex: 0,
    repeat: 'none',
    shuffle: false,
    adMode: 'audio',
    isPlayingAd: false,
    currentAd: null,
  });

  const [tracksSinceLastAd, setTracksSinceLastAd] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playTrack = useCallback(async (track: Track, queue: Track[] = [], index: number = 0) => {
    if (!audioRef.current) return;

    // Check if we should play an ad first
    if (tracksSinceLastAd >= AD_INTERVAL_TRACKS && !state.isPlayingAd) {
      await playAd();
      return;
    }

    audioRef.current.src = track.audio_url;
    audioRef.current.volume = state.volume;
    audioRef.current.muted = state.isMuted;
    
    try {
      await audioRef.current.play();
      setState(prev => ({
        ...prev,
        currentTrack: track,
        queue,
        currentIndex: index,
        isPlaying: true,
        isPlayingAd: false,
        currentAd: null,
      }));
    } catch (err) {
      console.error('Error playing track:', err);
    }
  }, [state.volume, state.isMuted, tracksSinceLastAd, state.isPlayingAd]);

  const playAd = useCallback(async () => {
    if (!audioRef.current || !userId) return;

    try {
      const ad = await getActiveAd(state.adMode);
      if (!ad) {
        // No ad available, continue with music
        setTracksSinceLastAd(0);
        return;
      }

      const adRecord = ad as Record<string, any>;
      audioRef.current.src = adRecord.content_url;
      audioRef.current.volume = state.adMode === 'audio' ? state.volume : 0.1;
      
      await audioRef.current.play();
      
      setState(prev => ({
        ...prev,
        isPlayingAd: true,
        currentAd: ad,
        isPlaying: true,
      }));

      // Increment ad impressions
      await incrementAdImpressions(adRecord.id);

      // Calculate coins based on ad type
      const coinsToAward = state.adMode === 'video' ? COINS_PER_AD_VIDEO : COINS_PER_AD_AUDIO;
      
      // Record ad view and award coins
      setTimeout(async () => {
        await recordAdView({
          user_id: userId,
          ad_id: adRecord.id,
          track_id: state.currentTrack?.id || '',
          completed: true,
          coins_earned: coinsToAward,
        });

        // Update user coins
        await updateUserCoins(userId, coinsToAward);
        setCoinsEarned(prev => prev + coinsToAward);
        setTracksSinceLastAd(0);
      }, adRecord.duration * 1000);

    } catch (err) {
      console.error('Error playing ad:', err);
      setTracksSinceLastAd(0);
    }
  }, [state.adMode, state.volume, userId, state.currentTrack]);

  const handleTrackEnd = useCallback(() => {
    if (state.isPlayingAd) {
      // Ad finished, resume music
      setState(prev => ({
        ...prev,
        isPlayingAd: false,
        currentAd: null,
      }));
      
      // Resume previous track or play next
      if (state.currentTrack) {
        playTrack(state.currentTrack, state.queue, state.currentIndex);
      } else {
        skipNext();
      }
      return;
    }

    setTracksSinceLastAd(prev => prev + 1);

    if (state.repeat === 'one') {
      if (state.currentTrack) {
        playTrack(state.currentTrack, state.queue, state.currentIndex);
      }
    } else {
      skipNext();
    }
  }, [state.isPlayingAd, state.currentTrack, state.queue, state.currentIndex, state.repeat, playTrack]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !state.currentTrack) return;

    if (state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [state.isPlaying, state.currentTrack]);

  const skipNext = useCallback(() => {
    if (state.queue.length === 0) return;

    let nextIndex: number;
    
    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeat === 'all') {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    const nextTrack = state.queue[nextIndex];
    playTrack(nextTrack, state.queue, nextIndex);
  }, [state.queue, state.currentIndex, state.shuffle, state.repeat, playTrack]);

  const skipPrevious = useCallback(() => {
    if (state.queue.length === 0) return;

    let prevIndex = state.currentIndex - 1;
    if (prevIndex < 0) {
      if (state.repeat === 'all') {
        prevIndex = state.queue.length - 1;
      } else {
        return;
      }
    }

    const prevTrack = state.queue[prevIndex];
    playTrack(prevTrack, state.queue, prevIndex);
  }, [state.queue, state.currentIndex, state.repeat, playTrack]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    setState(prev => ({ ...prev, volume }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const newMuted = !state.isMuted;
    audioRef.current.muted = newMuted;
    setState(prev => ({ ...prev, isMuted: newMuted }));
  }, [state.isMuted]);

  const toggleShuffle = useCallback(() => {
    setState(prev => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState(prev => ({
      ...prev,
      repeat: prev.repeat === 'none' ? 'all' : prev.repeat === 'all' ? 'one' : 'none',
    }));
  }, []);

  const setAdMode = useCallback((mode: 'audio' | 'video') => {
    setState(prev => ({ ...prev, adMode: mode }));
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queue: [],
      currentIndex: 0,
    }));
  }, []);

  return {
    ...state,
    coinsEarned,
    audioRef,
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
    addToQueue,
    clearQueue,
  };
}
