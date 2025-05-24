import { useState, useEffect } from 'react';
import { Movie, TMDBMovie, TMDBGenre, MOVIES_STORAGE_KEY, SortOption } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';
import { DropResult } from 'react-beautiful-dnd';
import { 
  fetchGenres, 
  searchMovie, 
  fetchMovieDetails, 
  extractDirectorAndActors,
  TMDB_IMAGE_URL 
} from '@/services/tmdbService';

export function useMovieData(initialMovies: Movie[]) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { toast } = useToast();

  // Load saved movies from localStorage
  useEffect(() => {
    const savedMovies = localStorage.getItem(MOVIES_STORAGE_KEY);
    if (savedMovies) {
      try {
        const parsedMovies = JSON.parse(savedMovies);
        console.log('Loaded movies from localStorage:', parsedMovies.slice(0, 3).map(m => ({
          title: m.title,
          director: m.director,
          actors: m.actors
        })));
        setMovies(parsedMovies);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing saved movies:', error);
        fetchInitialMovieData();
      }
    } else {
      console.log('No saved movies found, fetching initial data');
      fetchInitialMovieData();
    }
  }, []);
  
  // Save movies to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && movies.length > 0) {
      localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(movies));
    }
  }, [movies, isLoading]);

  // Fetch genres from TMDB API
  useEffect(() => {
    const loadGenres = async () => {
      const genresList = await fetchGenres();
      setGenres(genresList);
    };
    loadGenres();
  }, []);

  // Function to fetch initial movie data with enhanced details
  const fetchInitialMovieData = async () => {
    setIsLoading(true);
    try {
      console.log('Starting to fetch movie data for', initialMovies.length, 'movies');
      
      const movieDetailsPromises = initialMovies.map(async (movie, index) => {
        console.log(`Fetching data for movie ${index + 1}/${initialMovies.length}: ${movie.title}`);
        
        const tmdbMovie = await searchMovie(movie.title, movie.searchYear);
        
        if (tmdbMovie) {
          console.log(`Found TMDB data for ${movie.title}:`, tmdbMovie);
          
          // Fetch detailed movie information including cast and crew
          const movieDetails = await fetchMovieDetails(tmdbMovie.id);
          console.log(`Movie details for ${movie.title}:`, movieDetails);
          
          // Convert TMDB vote average (0-10) to Rotten Tomatoes style score (0-100)
          const rottenTomatoesScore = Math.round(tmdbMovie.vote_average * 10);
          
          // Get the first genre
          const genreName = tmdbMovie.genre_ids.length > 0 && genres.length > 0
            ? genres.find(g => g.id === tmdbMovie.genre_ids[0])?.name
            : undefined;
          
          // Extract year from release date
          const year = tmdbMovie.release_date 
            ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
            : undefined;
          
          // Get poster URL
          const imageUrl = tmdbMovie.poster_path 
            ? `${TMDB_IMAGE_URL}${tmdbMovie.poster_path}`
            : undefined;
          
          // Extract director and actors if available
          let director: string | undefined;
          let actors: string[] = [];
          
          if (movieDetails) {
            const { director: extractedDirector, actors: extractedActors } = extractDirectorAndActors(movieDetails);
            director = extractedDirector;
            actors = extractedActors;
            console.log(`Extracted for ${movie.title}:`, { director, actors });
          } else {
            console.log(`No detailed movie data found for ${movie.title}`);
          }
          
          return {
            ...movie,
            year,
            genre: genreName,
            rottenTomatoesScore,
            imageUrl,
            director,
            actors,
            watched: false
          };
        } else {
          console.log(`No TMDB data found for ${movie.title}`);
        }
        
        return { ...movie, watched: false };
      });
      
      const moviesWithDetails = await Promise.all(movieDetailsPromises);
      console.log('Finished fetching all movie data. Sample results:', 
        moviesWithDetails.slice(0, 3).map(m => ({
          title: m.title,
          director: m.director,
          actors: m.actors,
          hasDirector: !!m.director,
          hasActors: !!m.actors && m.actors.length > 0
        }))
      );
      setMovies(moviesWithDetails);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setMovies(initialMovies.map(movie => ({ ...movie, watched: false })));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...movies];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.actors?.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply genre filter
    if (selectedGenre !== 'all') {
      result = result.filter(movie => movie.genre === selectedGenre);
    }
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'rank':
          return sortDirection === 'asc' 
            ? a.rank - b.rank
            : b.rank - a.rank;
        
        case 'title-asc':
          return a.title.localeCompare(b.title);
        
        case 'title-desc':
          return b.title.localeCompare(a.title);
          
        case 'year':
          const yearA = a.year || 0;
          const yearB = b.year || 0;
          return sortDirection === 'asc'
            ? yearA - yearB
            : yearB - yearA;
            
        case 'rating':
          const ratingA = a.rottenTomatoesScore || 0;
          const ratingB = b.rottenTomatoesScore || 0;
          return sortDirection === 'asc'
            ? ratingA - ratingB
            : ratingB - ratingA;
            
        default:
          return 0;
      }
    });

    setFilteredMovies(result);
  }, [movies, searchTerm, selectedGenre, sortOption, sortDirection]);

  // Handle toggling watched status
  const handleToggleWatched = (id: number) => {
    const updatedMovies = movies.map(movie => {
      if (movie.id === id) {
        const newWatchedStatus = !movie.watched;
        return { ...movie, watched: newWatchedStatus };
      }
      return movie;
    });
    
    setMovies(updatedMovies);
    
    const toggledMovie = updatedMovies.find(m => m.id === id);
    
    if (toggledMovie) {
      toast({
        title: toggledMovie.watched ? "Movie Marked as Watched" : "Movie Marked as Unwatched",
        description: `"${toggledMovie.title}" has been ${toggledMovie.watched ? 'marked as watched' : 'removed from watched list'}`,
        duration: 2000,
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    console.log('Drag end result:', result);

    // Dropped outside the list
    if (!destination) {
      console.log('Dropped outside the list');
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('Dropped in the same position');
      return;
    }

    // Create a copy of filtered movies
    const newFilteredMovies = Array.from(filteredMovies);
    // Remove the moved item from the array
    const [removed] = newFilteredMovies.splice(source.index, 1);
    // Insert it at the new position
    newFilteredMovies.splice(destination.index, 0, removed);

    console.log(`Moving ${removed.title} from position ${source.index} to ${destination.index}`);

    // Update ranks based on new positions for all filtered movies
    const rankedFilteredMovies = newFilteredMovies.map((movie, index) => ({
      ...movie,
      rank: index + 1,
    }));

    // Update all movies with the new rankings
    const updatedMovies = movies.map(movie => {
      const updatedMovie = rankedFilteredMovies.find(m => m.id === movie.id);
      if (updatedMovie) {
        return updatedMovie;
      }
      return movie;
    });

    setFilteredMovies(rankedFilteredMovies);
    setMovies(updatedMovies);
    
    toast({
      title: "Movie Ranking Updated",
      description: `"${removed.title}" is now ranked #${destination.index + 1}`,
      duration: 2000,
    });
  };

  const resetRankings = () => {
    const sortedMovies = [...initialMovies].map((movie, index) => {
      const existingMovie = movies.find(m => m.id === movie.id);
      return {
        ...movie,
        rank: index + 1,
        year: existingMovie?.year,
        genre: existingMovie?.genre,
        imageUrl: existingMovie?.imageUrl,
        rottenTomatoesScore: existingMovie?.rottenTomatoesScore,
        director: existingMovie?.director,
        actors: existingMovie?.actors,
        watched: existingMovie?.watched || false,
      };
    });

    setMovies(sortedMovies);
    
    toast({
      title: "Rankings Reset",
      description: "All movies have been returned to their original order.",
      duration: 2000,
    });
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSortOptionChange = (value: string) => {
    setSortOption(value as SortOption);
  };

  const handleEditMovie = (id: number) => {
    const movieToEdit = movies.find(m => m.id === id);
    if (movieToEdit) {
      setEditingMovie(movieToEdit);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveMovieTitle = async (id: number, newTitle: string) => {
    const updatedMovies = movies.map(movie => {
      if (movie.id === id) {
        return { ...movie, title: newTitle };
      }
      return movie;
    });
    
    setMovies(updatedMovies);
    
    try {
      const tmdbMovie = await searchMovie(newTitle);
      
      if (tmdbMovie) {
        const movieDetails = await fetchMovieDetails(tmdbMovie.id);
        const rottenTomatoesScore = Math.round(tmdbMovie.vote_average * 10);
        
        const genreName = tmdbMovie.genre_ids.length > 0 && genres.length > 0
          ? genres.find(g => g.id === tmdbMovie.genre_ids[0])?.name
          : undefined;
        
        const year = tmdbMovie.release_date 
          ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
          : undefined;
        
        const imageUrl = tmdbMovie.poster_path 
          ? `${TMDB_IMAGE_URL}${tmdbMovie.poster_path}`
          : undefined;
        
        let director: string | undefined;
        let actors: string[] = [];
        
        if (movieDetails) {
          const { director: extractedDirector, actors: extractedActors } = extractDirectorAndActors(movieDetails);
          director = extractedDirector;
          actors = extractedActors;
        }
        
        const refreshedMovies = movies.map(movie => {
          if (movie.id === id) {
            return {
              ...movie,
              title: newTitle,
              year,
              genre: genreName,
              rottenTomatoesScore,
              imageUrl,
              director,
              actors
            };
          }
          return movie;
        });
        
        setMovies(refreshedMovies);
        
        toast({
          title: "Movie Updated",
          description: `"${newTitle}" has been updated with fresh data.`,
          duration: 2000,
        });
      } else {
        toast({
          title: "Title Updated",
          description: `Movie title changed to "${newTitle}". No additional data found.`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error refreshing movie data:', error);
      toast({
        title: "Update Error",
        description: "Failed to refresh movie data. Title was updated.",
        duration: 2000,
      });
    }
  };

  const resetLocalStorage = () => {
    localStorage.removeItem(MOVIES_STORAGE_KEY);
    fetchInitialMovieData();
    
    toast({
      title: "Data Reset",
      description: "All saved data has been cleared and reset to default.",
      duration: 2000,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('all');
  };

  const uniqueGenres = Array.from(
    new Set(movies.filter(movie => movie.genre).map(movie => movie.genre))
  ).filter(Boolean) as string[];

  const handleSelectTMDBMovie = (id: number, tmdbMovie: TMDBMovie) => {
    try {
      const rottenTomatoesScore = Math.round(tmdbMovie.vote_average * 10);
      
      const genreName = tmdbMovie.genre_ids.length > 0 && genres.length > 0
        ? genres.find(g => g.id === tmdbMovie.genre_ids[0])?.name
        : undefined;
      
      const year = tmdbMovie.release_date 
        ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
        : undefined;
      
      const imageUrl = tmdbMovie.poster_path 
        ? `${TMDB_IMAGE_URL}${tmdbMovie.poster_path}`
        : undefined;
      
      const updatedMovies = movies.map(movie => {
        if (movie.id === id) {
          return {
            ...movie,
            title: tmdbMovie.title,
            year,
            genre: genreName,
            rottenTomatoesScore,
            imageUrl
          };
        }
        return movie;
      });
      
      setMovies(updatedMovies);
      
      toast({
        title: "Movie Updated",
        description: `"${tmdbMovie.title}" has been updated with TMDB data.`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating movie with TMDB data:', error);
      toast({
        title: "Update Error",
        description: "Failed to update movie with TMDB data.",
        duration: 2000,
      });
    }
  };

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
    handleToggleWatched
  };
}
