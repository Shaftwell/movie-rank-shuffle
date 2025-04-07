import { useState, useEffect } from 'react';
import { Movie, TMDBMovie, TMDBGenre, MOVIES_STORAGE_KEY, SortOption } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';
import { DropResult } from 'react-beautiful-dnd';

// TMDB API base URL for images
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w200";

// Special cases for remakes - map movie titles to specific search queries with years
const SPECIAL_CASES: Record<string, { query: string, year?: number, tmdbId?: number }> = {
  "The Thomas Crown Affair (1999)": { query: "The Thomas Crown Affair", year: 1999 },
  "Bloodsport (1988)": { query: "Bloodsport", year: 1988 },
  "Sherlock Holmes (2009)": { query: "Sherlock Holmes", year: 2009 },
  "Ocean's Eleven": { query: "Ocean's Eleven", year: 2001 },
  "Parasite": { query: "Parasite Gisaengchung", year: 2019, tmdbId: 496243 },
  "Parasite (기생충)": { query: "Parasite Gisaengchung", year: 2019, tmdbId: 496243 },
  "Up": { query: "Up Pixar", year: 2009 },
  "Up (2009)": { query: "Up Pixar", year: 2009 },
  "Gladiator": { query: "Gladiator Russell Crowe", year: 2000 },
};

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
  const [isSocialShareDialogOpen, setIsSocialShareDialogOpen] = useState(false);

  const { toast } = useToast();

  // Load saved movies from localStorage
  useEffect(() => {
    const savedMovies = localStorage.getItem(MOVIES_STORAGE_KEY);
    if (savedMovies) {
      try {
        const parsedMovies = JSON.parse(savedMovies);
        // Ensure we only keep the top 25 movies
        const topMovies = parsedMovies.slice(0, 25);
        setMovies(topMovies);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing saved movies:', error);
        fetchInitialMovieData();
      }
    } else {
      fetchInitialMovieData();
    }
  }, []);
  
  // Save movies to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && movies.length > 0) {
      // Only save the top 25 movies
      const topMovies = movies.slice(0, 25);
      localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(topMovies));
    }
  }, [movies, isLoading]);

  // Fetch genres from TMDB API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          'https://api.themoviedb.org/3/genre/movie/list?api_key=2dca580c2a14b55200e784d157207b4d&language=en-US'
        );
        const data = await response.json();
        setGenres(data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);
  
  // Function to fetch initial movie data
  const fetchInitialMovieData = async () => {
    setIsLoading(true);
    try {
      // Ensure we only process the top 25 movies
      const top20Movies = initialMovies.slice(0, 20);
      
      const movieDetailsPromises = top20Movies.map(async (movie) => {
        // Handle special cases for remakes
        const specialCase = SPECIAL_CASES[movie.title];
        
        if (specialCase && specialCase.tmdbId) {
          // If we have a direct TMDB ID, fetch the movie details directly
          console.log(`Using direct TMDB ID ${specialCase.tmdbId} for ${movie.title}`);
          
          try {
            const detailResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${specialCase.tmdbId}?api_key=2dca580c2a14b55200e784d157207b4d`
            );
            const tmdbMovie = await detailResponse.json();
            
            if (tmdbMovie && tmdbMovie.id) {
              // Convert TMDB vote average (0-10) to Rotten Tomatoes style score (0-100)
              const rottenTomatoesScore = Math.round(tmdbMovie.vote_average * 10);
              
              // Get the first genre
              const genreName = tmdbMovie.genres && tmdbMovie.genres.length > 0
                ? tmdbMovie.genres[0].name
                : undefined;
              
              // Extract year from release date
              const year = tmdbMovie.release_date 
                ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
                : undefined;
              
              // Get poster URL
              const imageUrl = tmdbMovie.poster_path 
                ? `${TMDB_IMAGE_URL}${tmdbMovie.poster_path}`
                : undefined;
              
              return {
                ...movie,
                year,
                searchYear: specialCase.year,
                genre: genreName,
                rottenTomatoesScore,
                imageUrl,
                favorite: false,
                tmdbId: tmdbMovie.id
              };
            }
          } catch (detailError) {
            console.error(`Error fetching details for ${movie.title} with ID ${specialCase.tmdbId}:`, detailError);
          }
        }
        
        // Prepare search query with potential year filter
        let searchQuery = movie.title;
        let searchYear = undefined;
        
        if (specialCase) {
          searchQuery = specialCase.query;
          searchYear = specialCase.year;
          console.log(`Using special case for ${movie.title}: query=${searchQuery}, year=${searchYear}`);
        }
        
        // Build search URL with optional year parameter
        let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=2dca580c2a14b55200e784d157207b4d&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
        
        if (searchYear) {
          searchUrl += `&year=${searchYear}`;
        }
        
        try {
          // Search for the movie to get TMDB ID
          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();
          
          if (searchData.results && searchData.results.length > 0) {
            // Find the best match by sorting results
            const sortedResults = [...searchData.results].sort((a, b) => {
              // If we have a specific year to match
              if (searchYear) {
                const yearA = a.release_date ? parseInt(a.release_date.split('-')[0], 10) : 0;
                const yearB = b.release_date ? parseInt(b.release_date.split('-')[0], 10) : 0;
                
                // Exact year match gets highest priority
                if (yearA === searchYear && yearB !== searchYear) return -1;
                if (yearB === searchYear && yearA !== searchYear) return 1;
              }
              
              // Then sort by vote average (rating)
              return b.vote_average - a.vote_average;
            });
            
            const tmdbMovie = sortedResults[0] as TMDBMovie;
            
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
              
            // Get TMDB ID for linking
            const tmdbId = tmdbMovie.id;
            
            return {
              ...movie,
              year,
              searchYear,
              genre: genreName,
              rottenTomatoesScore,
              imageUrl,
              favorite: false,
              tmdbId
            };
          }
        } catch (searchError) {
          console.error(`Error searching for ${movie.title}:`, searchError);
        }
        
        return movie;
      });
      
      const moviesWithDetails = await Promise.all(movieDetailsPromises);
      setMovies(moviesWithDetails);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setMovies(initialMovies.slice(0, 20));
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
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
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
          // Handle missing year values
          const yearA = a.year || 0;
          const yearB = b.year || 0;
          return sortDirection === 'asc'
            ? yearA - yearB
            : yearB - yearA;
            
        case 'rating':
          // Handle missing rating values
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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Create a copy of filtered movies
    const newFilteredMovies = Array.from(filteredMovies);
    // Remove the moved item from the array
    const [removed] = newFilteredMovies.splice(source.index, 1);
    // Insert it at the new position
    newFilteredMovies.splice(destination.index, 0, removed);

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
    const sortedMovies = [...initialMovies].slice(0, 25).map((movie, index) => {
      const existingMovie = movies.find(m => m.id === movie.id);
      return {
        ...movie,
        rank: index + 1,
        year: existingMovie?.year,
        searchYear: existingMovie?.searchYear,
        genre: existingMovie?.genre,
        imageUrl: existingMovie?.imageUrl,
        rottenTomatoesScore: existingMovie?.rottenTomatoesScore,
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
      const specialCase = SPECIAL_CASES[newTitle];
      
      // If we have a specific TMDB ID for this title, fetch it directly
      if (specialCase && specialCase.tmdbId) {
        const detailResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${specialCase.tmdbId}?api_key=2dca580c2a14b55200e784d157207b4d`
        );
        const tmdbMovie = await detailResponse.json();
        
        if (tmdbMovie && tmdbMovie.id) {
          // Convert TMDB vote average (0-10) to Rotten Tomatoes style score (0-100)
          const rottenTomatoesScore = Math.round(tmdbMovie.vote_average * 10);
          
          // Get the first genre
          const genreName = tmdbMovie.genres && tmdbMovie.genres.length > 0
            ? tmdbMovie.genres[0].name
            : undefined;
          
          // Extract year from release date
          const year = tmdbMovie.release_date 
            ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
            : undefined;
          
          // Get poster URL
          const imageUrl = tmdbMovie.poster_path 
            ? `${TMDB_IMAGE_URL}${tmdbMovie.poster_path}`
            : undefined;
          
          const refreshedMovies = movies.map(movie => {
            if (movie.id === id) {
              return {
                ...movie,
                title: newTitle,
                year,
                searchYear: specialCase.year,
                genre: genreName,
                rottenTomatoesScore,
                imageUrl,
                tmdbId: tmdbMovie.id
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
          
          return;
        }
      }
      
      // Standard search query approach if no direct TMDB ID
      let searchQuery = newTitle;
      let searchYear = undefined;
      
      if (specialCase) {
        searchQuery = specialCase.query;
        searchYear = specialCase.year;
      }
      
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=2dca580c2a14b55200e784d157207b4d&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
      
      if (searchYear) {
        searchUrl += `&year=${searchYear}`;
      }
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        // Sort results by rating for best match
        const sortedResults = [...searchData.results].sort((a, b) => {
          // If we have a specific year to match
          if (searchYear) {
            const yearA = a.release_date ? parseInt(a.release_date.split('-')[0], 10) : 0;
            const yearB = b.release_date ? parseInt(b.release_date.split('-')[0], 10) : 0;
            
            // Exact year match gets highest priority
            if (yearA === searchYear && yearB !== searchYear) return -1;
            if (yearB === searchYear && yearA !== searchYear) return 1;
          }
          
          // Then sort by vote average (rating)
          return b.vote_average - a.vote_average;
        });
        
        const tmdbMovie = sortedResults[0] as TMDBMovie;
        
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
        
        const refreshedMovies = movies.map(movie => {
          if (movie.id === id) {
            return {
              ...movie,
              title: newTitle,
              year,
              searchYear,
              genre: genreName,
              rottenTomatoesScore,
              imageUrl,
              tmdbId: tmdbMovie.id
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

  const handleSelectTMDBMovie = (id: number, tmdbMovie: TMDBMovie) => {
    try {
      // Process the selected TMDB movie data
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
      
      // Update the movie with the new data from TMDB
      const updatedMovies = movies.map(movie => {
        if (movie.id === id) {
          return {
            ...movie,
            title: tmdbMovie.title,
            year,
            genre: genreName,
            rottenTomatoesScore,
            imageUrl,
            tmdbId: tmdbMovie.id
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
    isSocialShareDialogOpen,
    setIsSocialShareDialogOpen,
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
    clearFilters
  };
}
