import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Play, Heart, Music, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { usePlayer } from '@/hooks/usePlayer';
import type { Track, User } from '@/types';

interface LibraryPageProps {
  user?: User | null;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'duration', label: 'Duration' },
  { value: 'alphabetical', label: 'A-Z' },
];

export function LibraryPage({ user }: LibraryPageProps) {
  const navigate = useNavigate();
  const { tracks, genres, moods, loading, searchTracks } = useMusicLibrary();
  const { playTrack } = usePlayer(user?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [durationRange, setDurationRange] = useState([0, 600]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Load tracks on mount and when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      searchTracks(
        {
          search: searchQuery,
          genre: selectedGenre,
          mood: selectedMood,
          sort_by: selectedSort as any,
          duration_min: durationRange[0],
          duration_max: durationRange[1],
        },
        page,
        20
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedGenre, selectedMood, selectedSort, durationRange, page]);

  const handlePlayTrack = useCallback(
    (track: Track) => {
      playTrack(track, tracks, tracks.findIndex((t) => t.id === track.id));
      navigate('/player');
    },
    [playTrack, tracks, navigate]
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedMood('');
    setSelectedSort('newest');
    setDurationRange([0, 600]);
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery || selectedGenre || selectedMood || selectedSort !== 'newest';

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-medium text-white mb-2 font-['Fraunces']">
            Music Library
          </h1>
          <p className="text-white/60">
            Discover thousands of royalty-free tracks. Play and earn coins.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type="text"
                placeholder="Search tracks, artists, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF5A65] focus:ring-[#FF5A65]/20"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-6 border-white/20 ${
                showFilters ? 'bg-[#FF5A65]/20 border-[#FF5A65]' : ''
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="glass-card p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
              {/* Genre & Mood */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Genre</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedGenre === '' ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        selectedGenre === ''
                          ? 'bg-[#FF5A65] hover:bg-[#FF6B75]'
                          : 'border-white/20 hover:border-[#FF5A65]'
                      }`}
                      onClick={() => setSelectedGenre('')}
                    >
                      All
                    </Badge>
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={selectedGenre === genre ? 'default' : 'outline'}
                        className={`cursor-pointer ${
                          selectedGenre === genre
                            ? 'bg-[#FF5A65] hover:bg-[#FF6B75]'
                            : 'border-white/20 hover:border-[#FF5A65]'
                        }`}
                        onClick={() => setSelectedGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/60 mb-2 block">Mood</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedMood === '' ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        selectedMood === ''
                          ? 'bg-[#FF5A65] hover:bg-[#FF6B75]'
                          : 'border-white/20 hover:border-[#FF5A65]'
                      }`}
                      onClick={() => setSelectedMood('')}
                    >
                      All
                    </Badge>
                    {moods.map((mood) => (
                      <Badge
                        key={mood}
                        variant={selectedMood === mood ? 'default' : 'outline'}
                        className={`cursor-pointer ${
                          selectedMood === mood
                            ? 'bg-[#FF5A65] hover:bg-[#FF6B75]'
                            : 'border-white/20 hover:border-[#FF5A65]'
                        }`}
                        onClick={() => setSelectedMood(mood)}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <label className="text-sm text-white/60 mb-4 block">
                  Duration: {formatDuration(durationRange[0])} -{' '}
                  {formatDuration(durationRange[1])}
                </label>
                <Slider
                  value={durationRange}
                  onValueChange={setDurationRange}
                  max={600}
                  step={30}
                  className="w-full"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-[#FF5A65] hover:text-[#FF8A93] hover:bg-[#FF5A65]/10"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}

          {/* Sort & Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">
              {loading ? 'Loading...' : `${tracks.length} tracks found`}
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/20">
                  <Filter className="w-4 h-4 mr-2" />
                  {sortOptions.find((o) => o.value === selectedSort)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a1a] border-white/10">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSelectedSort(option.value)}
                    className="text-white hover:bg-white/10 cursor-pointer"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tracks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF5A65]/20 border-t-[#FF5A65] rounded-full animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No tracks found</h3>
            <p className="text-white/60">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="group glass-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5A65]/30 cursor-pointer"
                onClick={() => handlePlayTrack(track)}
              >
                {/* Cover Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-white/5">
                  {track.cover_url ? (
                    <img
                      src={track.cover_url}
                      alt={track.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-12 h-12 text-white/20" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                    {formatDuration(track.duration)}
                  </div>
                </div>

                {/* Track Info */}
                <div className="space-y-1">
                  <h3 className="text-white font-medium truncate group-hover:text-[#FF5A65] transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-white/60 text-sm truncate">{track.artist}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 text-white/40 text-xs">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {track.plays.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {track.likes}
                      </span>
                    </div>

                    <Badge variant="outline" className="text-xs border-white/20">
                      {track.genre}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Focus Modes */}
        <div className="mt-16">
          <h2 className="text-2xl font-medium text-white mb-6 font-['Fraunces']">
            Focus Modes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Focus', icon: '🎯', desc: 'Deep concentration', color: '#FF5A65' },
              { name: 'Study', icon: '📚', desc: 'Learning & reading', color: '#4ECDC4' },
              { name: 'Sleep', icon: '🌙', desc: 'Relax & unwind', color: '#A78BFA' },
              { name: 'Workout', icon: '💪', desc: 'Energy & motivation', color: '#F59E0B' },
            ].map((mode) => (
              <div
                key={mode.name}
                className="glass-card p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/30 group"
                onClick={() => navigate('/player', { state: { focusMode: mode.name.toLowerCase() } })}
              >
                <div
                  className="text-4xl mb-3 transform group-hover:scale-110 transition-transform"
                  style={{ filter: `drop-shadow(0 0 20px ${mode.color}40)` }}
                >
                  {mode.icon}
                </div>
                <h3 className="text-white font-medium mb-1">{mode.name}</h3>
                <p className="text-white/60 text-sm">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
