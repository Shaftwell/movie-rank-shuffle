
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TMDBMovie } from '@/types/movie';
import { Skeleton } from '@/components/ui/skeleton';

const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w200";

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=2dca580c2a14b55200e784d157207b4d&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
      
      if (year) {
        searchUrl += `&year=${year}`;
      }
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
        setError('No movies found. Try a different search term.');
      }
    } catch (err) {
      console.error('Error searching TMDB:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Input 
          placeholder="Year (optional)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-24"
          type="number"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          Search
        </Button>
      </div>
      
      {error && <p className="text-destructive">{error}</p>}
      
      {isSearching ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto">
          {searchResults.map((movie) => (
            <div 
              key={movie.id}
              className="flex border rounded-md p-2 cursor-pointer hover:bg-accent"
              onClick={() => onSelectMovie(movie)}
            >
              {movie.poster_path ? (
                <img 
                  src={`${TMDB_IMAGE_URL}${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded-sm"
                />
              ) : (
                <div className="w-16 h-24 bg-muted flex items-center justify-center rounded-sm">
                  <span className="text-xs text-center">No image</span>
                </div>
              )}
              <div className="ml-3 flex-1">
                <h4 className="font-medium">{movie.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
                </p>
                <p className="text-xs mt-1 line-clamp-2">
                  Rating: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TMDBSearch;
