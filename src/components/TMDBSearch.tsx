import React, { useState, useEffect, useCallback } from 'react';
import { Search, Film, Calendar, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TMDBMovie } from '@/types/movie';
import { Skeleton } from '@/components/ui/skeleton';
import { TMDB_IMAGE_URL } from '@/services/tmdbService';
import { useToast } from '@/hooks/use-toast';

interface TMDBSearchProps {
  onSelectMovie: (movie: TMDBMovie) => void;
  initialQuery?: string;
}

const TMDBSearch = ({ onSelectMovie, initialQuery = '' }: TMDBSearchProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [year, setYear] = useState<string>('');
  const { toast } = useToast();

  // Debounced search function
  const performSearch = useCallback(async (query: string, searchYear?: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Try to get API key from env, fallback to direct value if not available
      const apiKey = import.meta.env.VITE_TMDB_API_KEY || '2dca580c2a14b55200e784d157207b4d';

      if (!apiKey) {
        throw new Error('TMDB API key not configured');
      }

      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;

      if (searchYear && searchYear.trim()) {
        searchUrl += `&year=${searchYear}`;
      }

      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
        setError('');
      } else {
        setSearchResults([]);
        setError('No movies found. Try a different search term or year.');
      }
    } catch (err) {
      console.error('Error searching TMDB:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to search';
      setError(errorMessage);
      setSearchResults([]);

      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Auto-search when query changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, year);
      } else {
        setSearchResults([]);
        setError('');
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, year, performSearch]);

  const handleSearch = () => {
    performSearch(searchQuery, year);
  };

  const handleMovieSelect = (movie: TMDBMovie) => {
    onSelectMovie(movie);
    toast({
      title: "Movie Selected",
      description: `"${movie.title}" has been selected.`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a movie... (auto-search enabled)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Input
          placeholder="Year (optional)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-32"
          type="number"
          min="1900"
          max={new Date().getFullYear() + 5}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                className="group flex gap-3 border rounded-lg p-3 cursor-pointer hover:bg-accent hover:border-primary/30 transition-all"
                onClick={() => handleMovieSelect(movie)}
              >
                {movie.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-md flex-shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-24 bg-muted flex items-center justify-center rounded-md flex-shrink-0">
                    <Film className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {movie.release_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    )}
                    {movie.vote_average > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {movie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {movie.overview && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {movie.overview}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchQuery.trim() && !isSearching ? (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No results found</p>
          <p className="text-sm">Try a different search term or year</p>
        </div>
      ) : null}
    </div>
  );
};

export default TMDBSearch;
