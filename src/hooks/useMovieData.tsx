import { useState, useEffect, useMemo, useCallback } from 'react';
import { Movie, TMDBMovie, TMDBGenre, MOVIES_STORAGE_KEY, SortOption } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';
import { DropResult } from 'react-beautiful-dnd';
import { fetchGenres, searchMovie } from '@/services/tmdbService';
import { enrichMovieWithTMDB, enrichMovieWithBasicTMDB } from '@/utils/movieEnrichment';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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

  // Load genres on mount
  useEffect(() => {
    fetchGenres().then(setGenres);
  }, []);

  // Initialize movies if not in localStorage or if missing director/actors
  useEffect(() => {
    if (movies.length === 0) {
      fetchInitialMovieData();
    } else {
      // Check if movies are missing director/actors data
      const needsRefresh = movies.some(m => !m.director && !m.actors);
      if (needsRefresh) {
        console.log('Movies missing director/actors data, refreshing...');
        fetchInitialMovieData();
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch initial movie data with TMDB enrichment
  const fetchInitialMovieData = useCallback(async () => {
    setIsLoading(true);
    try {
      const movieDetailsPromises = initialMovies.map(async (movie) => {
        const tmdbMovie = await searchMovie(movie.title, movie.searchYear);
        if (tmdbMovie) {
          return enrichMovieWithTMDB(movie, tmdbMovie, genres);
        }
        return movie;
      });

      const moviesWithDetails = await Promise.all(movieDetailsPromises);
      setMovies(moviesWithDetails);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setMovies(initialMovies);
      toast({
        title: "Error Loading Movies",
        description: "Failed to fetch movie details from TMDB.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [initialMovies, genres, setMovies, toast]);

  // Memoized filtered and sorted movies
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(movie =>
        movie.title.toLowerCase().includes(searchLower) ||
        movie.director?.toLowerCase().includes(searchLower) ||
        movie.actors?.some(actor => actor.toLowerCase().includes(searchLower))
      );
    }

    // Apply genre filter
    if (selectedGenre !== 'all') {
      result = result.filter(movie => movie.genre === selectedGenre);
    }

    // Apply sorting
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
          comparison = (a.rottenTomatoesScore || 0) - (b.rottenTomatoesScore || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [movies, searchTerm, selectedGenre, sortOption, sortDirection]);

  // Get unique genres from movies
  const uniqueGenres = useMemo(
    () => Array.from(new Set(movies.filter(m => m.genre).map(m => m.genre!))),
    [movies]
  );


  // Handle drag and drop
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newFilteredMovies = Array.from(filteredMovies);
    const [removed] = newFilteredMovies.splice(source.index, 1);
    newFilteredMovies.splice(destination.index, 0, removed);

    // Update ranks
    const rankedMovies = newFilteredMovies.map((movie, index) => ({
      ...movie,
      rank: index + 1,
    }));

    // Merge with unfiltered movies
    const updatedMovies = movies.map(movie => {
      const updated = rankedMovies.find(m => m.id === movie.id);
      return updated || movie;
    });

    setMovies(updatedMovies);

    toast({
      title: "Ranking Updated",
      description: `"${removed.title}" is now #${destination.index + 1}`,
    });
  }, [filteredMovies, movies, setMovies, toast]);

  // Reset to original rankings
  const resetRankings = useCallback(() => {
    const resetMovies = initialMovies.map((movie, index) => {
      const existing = movies.find(m => m.id === movie.id);
      return existing ? { ...existing, rank: index + 1 } : { ...movie, rank: index + 1 };
    });

    setMovies(resetMovies);
    toast({
      title: "Rankings Reset",
      description: "Movies returned to original order.",
    });
  }, [initialMovies, movies, setMovies, toast]);

  // Toggle sort direction
  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Handle sort option change
  const handleSortOptionChange = useCallback((value: string) => {
    setSortOption(value as SortOption);
  }, []);

  // Open edit dialog
  const handleEditMovie = useCallback((id: number) => {
    const movie = movies.find(m => m.id === id);
    if (movie) {
      setEditingMovie(movie);
      setIsEditDialogOpen(true);
    }
  }, [movies]);

  // Save movie title and refresh TMDB data
  const handleSaveMovieTitle = useCallback(async (id: number, newTitle: string) => {
    // Update title immediately
    setMovies(movies.map(movie =>
      movie.id === id ? { ...movie, title: newTitle } : movie
    ));

    try {
      const tmdbMovie = await searchMovie(newTitle);

      if (tmdbMovie) {
        const enrichedMovie = await enrichMovieWithTMDB(
          movies.find(m => m.id === id)!,
          tmdbMovie,
          genres
        );

        setMovies(movies.map(movie =>
          movie.id === id ? { ...enrichedMovie, title: newTitle } : movie
        ));

        toast({
          title: "Movie Updated",
          description: `"${newTitle}" updated with fresh data.`,
        });
      } else {
        toast({
          title: "Title Updated",
          description: `Title changed to "${newTitle}". No TMDB data found.`,
        });
      }
    } catch (error) {
      console.error('Error refreshing movie data:', error);
      toast({
        title: "Update Error",
        description: "Failed to refresh movie data.",
        variant: "destructive",
      });
    }
  }, [movies, genres, setMovies, toast]);

  // Update movie with selected TMDB data
  const handleSelectTMDBMovie = useCallback(async (id: number, tmdbMovie: TMDBMovie) => {
    try {
      const movie = movies.find(m => m.id === id);
      if (!movie) return;

      const enrichedMovie = await enrichMovieWithBasicTMDB(movie, tmdbMovie, genres);

      setMovies(movies.map(m =>
        m.id === id ? { ...enrichedMovie, title: tmdbMovie.title } : m
      ));

      toast({
        title: "Movie Updated",
        description: `"${tmdbMovie.title}" updated with TMDB data.`,
      });
    } catch (error) {
      console.error('Error updating movie with TMDB data:', error);
      toast({
        title: "Update Error",
        description: "Failed to update movie.",
        variant: "destructive",
      });
    }
  }, [movies, genres, setMovies, toast]);

  // Reset all data
  const resetLocalStorage = useCallback(() => {
    clearMovies();
    fetchInitialMovieData();
    toast({
      title: "Data Reset",
      description: "All data cleared and reset to default.",
    });
  }, [clearMovies, fetchInitialMovieData, toast]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGenre('all');
  }, []);

  // Import rankings from token
  const importRankings = useCallback((importedMovies: Movie[]) => {
    setMovies(importedMovies);
    toast({
      title: "Rankings Imported",
      description: "Your movie rankings have been updated.",
    });
  }, [setMovies, toast]);

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
