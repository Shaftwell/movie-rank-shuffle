import { useState, useEffect, useMemo, useCallback } from 'react';
import { Movie, TMDBMovie, TMDBGenre, MOVIES_STORAGE_KEY, SortOption, getMovieScore } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';
import { DropResult } from '@hello-pangea/dnd';
import { fetchGenres, searchMovie, mapPool } from '@/services/tmdbService';
import { enrichMovieWithTMDB } from '@/utils/movieEnrichment';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const TMDB_CONCURRENCY = 5;

export function useMovieData(initialMovies: Movie[]) {
  const { toast } = useToast();
  const [movies, setMovies, clearMovies] = useLocalStorage<Movie[]>(MOVIES_STORAGE_KEY, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchInitialMovieData = useCallback(
    async (genreList: TMDBGenre[]) => {
      setIsLoading(true);
      try {
        const moviesWithDetails = await mapPool(initialMovies, TMDB_CONCURRENCY, async (movie) => {
          const tmdbMovie = await searchMovie(movie.title, movie.searchYear);
          if (tmdbMovie) {
            return enrichMovieWithTMDB(movie, tmdbMovie, genreList);
          }
          return movie;
        });
        setMovies(moviesWithDetails);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setMovies(initialMovies);
        toast({
          title: 'Error Loading Movies',
          description: 'Failed to fetch movie details from TMDB.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [initialMovies, setMovies, toast]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const loadedGenres = await fetchGenres();
      if (cancelled) return;
      setGenres(loadedGenres);

      const needsRefresh =
        movies.length === 0 || movies.some((m) => !m.director && !m.actors);
      if (needsRefresh) {
        await fetchInitialMovieData(loadedGenres);
      } else {
        setIsLoading(false);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchLower) ||
          movie.director?.toLowerCase().includes(searchLower) ||
          movie.actors?.some((actor) => actor.toLowerCase().includes(searchLower))
      );
    }

    if (selectedGenre !== 'all') {
      result = result.filter((movie) => movie.genre === selectedGenre);
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'rating':
          comparison = (getMovieScore(a) || 0) - (getMovieScore(b) || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [movies, searchTerm, selectedGenre, sortOption, sortDirection]);

  const uniqueGenres = useMemo(
    () => Array.from(new Set(movies.filter((m) => m.genre).map((m) => m.genre!))),
    [movies]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source } = result;

      if (
        !destination ||
        (destination.droppableId === source.droppableId && destination.index === source.index)
      ) {
        return;
      }

      const reordered = Array.from(filteredMovies);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      // Keep the existing rank numbers of the visible list; reassign them
      // in the new order so a filtered drag does not smash global ranks to 1..n.
      const preservedRanks = filteredMovies.map((movie) => movie.rank).sort((a, b) => a - b);
      const reRankedVisible = reordered.map((movie, index) => ({
        ...movie,
        rank: preservedRanks[index],
      }));

      const byId = new Map(reRankedVisible.map((movie) => [movie.id, movie]));
      setMovies(movies.map((movie) => byId.get(movie.id) || movie));

      toast({
        title: 'Ranking Updated',
        description: `"${removed.title}" is now #${preservedRanks[destination.index]}`,
      });
    },
    [filteredMovies, movies, setMovies, toast]
  );

  const resetRankings = useCallback(() => {
    const resetMovies = initialMovies.map((movie, index) => {
      const existing = movies.find((m) => m.id === movie.id);
      return existing ? { ...existing, rank: index + 1 } : { ...movie, rank: index + 1 };
    });

    setMovies(resetMovies);
    toast({
      title: 'Rankings Reset',
      description: 'Movies returned to original order.',
    });
  }, [initialMovies, movies, setMovies, toast]);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const handleSortOptionChange = useCallback((value: string) => {
    setSortOption(value as SortOption);
  }, []);

  const handleEditMovie = useCallback(
    (id: number) => {
      const movie = movies.find((m) => m.id === id);
      if (movie) {
        setEditingMovie(movie);
        setIsEditDialogOpen(true);
      }
    },
    [movies]
  );

  const handleSaveMovieTitle = useCallback(
    async (id: number, newTitle: string) => {
      setMovies(movies.map((movie) => (movie.id === id ? { ...movie, title: newTitle } : movie)));

      try {
        const tmdbMovie = await searchMovie(newTitle);
        const current = movies.find((m) => m.id === id);
        if (tmdbMovie && current) {
          const enrichedMovie = await enrichMovieWithTMDB(current, tmdbMovie, genres);
          setMovies(
            movies.map((movie) => (movie.id === id ? { ...enrichedMovie, title: newTitle } : movie))
          );
          toast({
            title: 'Movie Updated',
            description: `"${newTitle}" updated with fresh data.`,
          });
        } else {
          toast({
            title: 'Title Updated',
            description: `Title changed to "${newTitle}". No TMDB data found.`,
          });
        }
      } catch (error) {
        console.error('Error refreshing movie data:', error);
        toast({
          title: 'Update Error',
          description: 'Failed to refresh movie data.',
          variant: 'destructive',
        });
      }
    },
    [movies, genres, setMovies, toast]
  );

  const handleSelectTMDBMovie = useCallback(
    async (id: number, tmdbMovie: TMDBMovie) => {
      try {
        const movie = movies.find((m) => m.id === id);
        if (!movie) return;

        const enrichedMovie = await enrichMovieWithTMDB(movie, tmdbMovie, genres);
        setMovies(
          movies.map((m) => (m.id === id ? { ...enrichedMovie, title: tmdbMovie.title } : m))
        );

        toast({
          title: 'Movie Updated',
          description: `"${tmdbMovie.title}" updated with TMDB data.`,
        });
      } catch (error) {
        console.error('Error updating movie with TMDB data:', error);
        toast({
          title: 'Update Error',
          description: 'Failed to update movie.',
          variant: 'destructive',
        });
      }
    },
    [movies, genres, setMovies, toast]
  );

  const resetLocalStorage = useCallback(() => {
    clearMovies();
    void fetchInitialMovieData(genres);
    toast({
      title: 'Data Reset',
      description: 'All data cleared and reset to default.',
    });
  }, [clearMovies, fetchInitialMovieData, genres, toast]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGenre('all');
  }, []);

  const importRankings = useCallback(
    (importedMovies: Movie[]) => {
      setMovies(importedMovies);
      toast({
        title: 'Rankings Imported',
        description: 'Your movie rankings have been updated.',
      });
    },
    [setMovies, toast]
  );

  return {
    movies,
    filteredMovies,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedGenre,
    setSelectedGenre,
    sortOption,
    sortDirection,
    uniqueGenres,
    editingMovie,
    isEditDialogOpen,
    handleDragEnd,
    resetRankings,
    toggleSortDirection,
    handleSortOptionChange,
    handleEditMovie,
    handleSaveMovieTitle,
    handleSelectTMDBMovie,
    resetLocalStorage,
    setIsEditDialogOpen,
    setEditingMovie,
    clearFilters,
    importRankings,
  };
}
