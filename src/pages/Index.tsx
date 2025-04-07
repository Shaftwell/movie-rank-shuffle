
import React, { useEffect, useState } from 'react';
import MovieList from '@/components/MovieList';
import { Movie } from '@/types/movie';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [initialMovies, setInitialMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  
  // Fetch top-rated movies from TMDB
  useEffect(() => {
    const fetchTopRatedMovies = async () => {
      setIsLoading(true);
      try {
        // Request a larger number of movies (30) to ensure we get at least 25 valid entries
        const response = await fetch(
          'https://api.themoviedb.org/3/movie/top_rated?api_key=2dca580c2a14b55200e784d157207b4d&language=en-US&page=1'
        );
        const data = await response.json();
        
        // Take exactly 25 movies
        const topMovies = data.results.slice(0, 25).map((movie: any, index: number) => ({
          id: movie.id,
          title: movie.title,
          rank: index + 1,
          year: movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : undefined,
          imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : undefined,
          rottenTomatoesScore: Math.round(movie.vote_average * 10),
          genre: movie.genre_ids && movie.genre_ids.length > 0 ? movie.genre_ids[0] : undefined
        }));
        
        setInitialMovies(topMovies);
      } catch (error) {
        console.error('Error fetching top rated movies:', error);
        // Fallback to empty array
        setInitialMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopRatedMovies();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card py-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            The 25 Best Movies of my Life
          </h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="rounded-full shadow-sm"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </header>
      
      <main>
        {isLoading ? (
          <div className="container mx-auto py-12">
            <div className="flex flex-col gap-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-12 w-full" />
              <div className="space-y-4 mt-8">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <MovieList initialMovies={initialMovies} />
        )}
      </main>
      
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>Personal Movie Rankings Collection</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
