import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Track, Playlist, TrackFilter } from '@/types';

export function useMusicLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalTracks, setTotalTracks] = useState(0);

  // Load filters on mount
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      // Get unique genres
      const { data: genreData } = await supabase
        .from('tracks')
        .select('genre')
        .eq('active', true);

      if (genreData) {
        const uniqueGenres = [...new Set(genreData.map((t: any) => t.genre))].filter(Boolean);
        setGenres(uniqueGenres as string[]);
      }

      // Get unique moods
      const { data: moodData } = await supabase
        .from('tracks')
        .select('mood')
        .eq('active', true);

      if (moodData) {
        const uniqueMoods = [...new Set(moodData.map((t: any) => t.mood))].filter(Boolean);
        setMoods(uniqueMoods as string[]);
      }
    } catch (err) {
      console.error('Error loading filters:', err);
    }
  };

  const searchTracks = useCallback(async (filters: TrackFilter, page: number = 1, perPage: number = 20) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('tracks')
        .select('*', { count: 'exact' })
        .eq('active', true);

      if (filters.genre) {
        query = query.eq('genre', filters.genre);
      }

      if (filters.mood) {
        query = query.eq('mood', filters.mood);
      }

      if (filters.bpm_min) {
        query = query.gte('bpm', filters.bpm_min);
      }

      if (filters.bpm_max) {
        query = query.lte('bpm', filters.bpm_max);
      }

      if (filters.duration_min) {
        query = query.gte('duration', filters.duration_min);
      }

      if (filters.duration_max) {
        query = query.lte('duration', filters.duration_max);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,artist.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
      }

      // Apply sorting
      switch (filters.sort_by) {
        case 'popular':
          query = query.order('plays', { ascending: false });
          break;
        case 'duration':
          query = query.order('duration', { ascending: true });
          break;
        case 'alphabetical':
          query = query.order('title', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setTracks(data as Track[]);
      setTotalTracks(count || 0);
    } catch (err) {
      console.error('Error searching tracks:', err);
      setError('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrack = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Track;
    } catch (err) {
      console.error('Error getting track:', err);
      return null;
    }
  }, []);

  const incrementPlays = useCallback(async (trackId: string) => {
    try {
      await supabase.rpc('increment_track_plays', { track_id: trackId } as any);
    } catch (err) {
      console.error('Error incrementing plays:', err);
    }
  }, []);

  const getPlaylists = useCallback(async (userId?: string) => {
    try {
      let query = supabase
        .from('playlists')
        .select('*');

      if (userId) {
        query = query.or(`created_by.eq.${userId},is_public.eq.true`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data as Playlist[]);
    } catch (err) {
      console.error('Error getting playlists:', err);
    }
  }, []);

  const createPlaylist = useCallback(async (playlist: Partial<Playlist>) => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([playlist] as any)
        .select()
        .single();

      if (error) throw error;
      setPlaylists(prev => [data as Playlist, ...prev]);
      return data as Playlist;
    } catch (err) {
      console.error('Error creating playlist:', err);
      return null;
    }
  }, []);

  const getSmartPlaylist = useCallback(async (mood: string, limit: number = 20) => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('mood', mood)
        .eq('active', true)
        .order('plays', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Track[];
    } catch (err) {
      console.error('Error getting smart playlist:', err);
      return [];
    }
  }, []);

  const getFocusPlaylist = useCallback(async (mode: 'focus' | 'study' | 'sleep', limit: number = 50) => {
    const moodMap = {
      focus: ['calm', 'focused', 'instrumental'],
      study: ['calm', 'relaxing', 'ambient'],
      sleep: ['sleep', 'ambient', 'calm'],
    };

    const moods = moodMap[mode];
    
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .in('mood', moods)
        .eq('active', true)
        .lte('bpm', mode === 'sleep' ? 80 : 120)
        .order('plays', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Track[];
    } catch (err) {
      console.error('Error getting focus playlist:', err);
      return [];
    }
  }, []);

  return {
    tracks,
    playlists,
    genres,
    moods,
    loading,
    error,
    totalTracks,
    searchTracks,
    getTrack,
    incrementPlays,
    getPlaylists,
    createPlaylist,
    getSmartPlaylist,
    getFocusPlaylist,
    refreshFilters: loadFilters,
  };
}
