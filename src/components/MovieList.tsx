
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import MovieCard from './MovieCard';
import MovieEditDialog from './MovieEditDialog';
import { Movie, TMDBMovie, TMDBGenre } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, ArrowDown, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface MovieListProps {
  initialMovies: Movie[];
}

// TMDB API base URL for images
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w200";

// Special cases for remakes - map movie titles to specific search queries with years
const SPECIAL_CASES: Record<string, { query: string, year?: number }> = {
  "The Thomas Crown Affair": { query: "The Thomas Crown Affair", year: 1999 },
  "Bloodsport": { query: "Bloodsport", year: 1988 },
};

const MovieList = ({ initialMovies }: MovieListProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { toast } = useToast();

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

  // Fetch movie details from TMDB API
  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      try {
        const movieDetailsPromises = initialMovies.map(async (movie) => {
          // Handle special cases for remakes
          const specialCase = SPECIAL_CASES[movie.title];
          
          // Prepare search query with potential year filter
          let searchQuery = movie.title;
          let searchYear = undefined;
          
          if (specialCase) {
            searchQuery = specialCase.query;
            searchYear = specialCase.year;
          }
          
          // Build search URL with optional year parameter
          let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=2dca580c2a14b55200e784d157207b4d&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
          
          if (searchYear) {
            searchUrl += `&year=${searchYear}`;
          }
          
          // Search for the movie to get TMDB ID
          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();
          
          if (searchData.results && searchData.results.length > 0) {
            const tmdbMovie = searchData.results[0] as TMDBMovie;
            
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
            
            return {
              ...movie,
              year,
              searchYear,
              genre: genreName,
              rottenTomatoesScore,
              imageUrl,
              favorite: false
            };
          }
          
          return movie;
        });
        
        const moviesWithDetails = await Promise.all(movieDetailsPromises);
        setMovies(moviesWithDetails);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setMovies(initialMovies);
      } finally {
        setIsLoading(false);
      }
    };

    if (genres.length > 0) {
      fetchMovieDetails();
    }
  }, [initialMovies, genres]);

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
    result = result.sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.rank - b.rank;
      } else {
        return b.rank - a.rank;
      }
    });

    setFilteredMovies(result);
  }, [movies, searchTerm, selectedGenre, sortDirection]);

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
    const sortedMovies = [...initialMovies].map((movie, index) => {
      const existingMovie = movies.find(m => m.id === movie.id);
      return {
        ...movie,
        rank: index + 1,
        year: existingMovie?.year,
        searchYear: existingMovie?.searchYear,
        genre: existingMovie?.genre,
        favorite: existingMovie?.favorite || false,
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

  const handleToggleFavorite = (id: number) => {
    const updatedMovies = movies.map(movie => {
      if (movie.id === id) {
        const newFavoriteStatus = !movie.favorite;
        
        toast({
          title: newFavoriteStatus ? "Added to Favorites" : "Removed from Favorites",
          description: `"${movie.title}" has been ${newFavoriteStatus ? 'added to' : 'removed from'} your favorites.`,
          duration: 2000,
        });
        
        return { ...movie, favorite: newFavoriteStatus };
      }
      return movie;
    });
    
    setMovies(updatedMovies);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleEditMovie = (id: number) => {
    const movieToEdit = movies.find(m => m.id === id);
    if (movieToEdit) {
      setEditingMovie(movieToEdit);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveMovieTitle = async (id: number, newTitle: string) => {
    // Update the movie title
    const updatedMovies = movies.map(movie => {
      if (movie.id === id) {
        return { ...movie, title: newTitle };
      }
      return movie;
    });
    
    setMovies(updatedMovies);
    
    // Refresh data for the edited movie
    try {
      // Check if this is a special case for remake
      const specialCase = SPECIAL_CASES[newTitle];
      
      // Prepare search query with potential year filter
      let searchQuery = newTitle;
      let searchYear = undefined;
      
      if (specialCase) {
        searchQuery = specialCase.query;
        searchYear = specialCase.year;
      }
      
      // Build search URL with optional year parameter
      let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=2dca580c2a14b55200e784d157207b4d&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
      
      if (searchYear) {
        searchUrl += `&year=${searchYear}`;
      }
      
      // Search for the movie to get TMDB ID
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        const tmdbMovie = searchData.results[0] as TMDBMovie;
        
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
        
        // Update the movie with the new data
        const refreshedMovies = movies.map(movie => {
          if (movie.id === id) {
            return {
              ...movie,
              title: newTitle,
              year,
              searchYear,
              genre: genreName,
              rottenTomatoesScore,
              imageUrl
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

  // Get unique genres from movies
  const uniqueGenres = Array.from(
    new Set(movies.filter(movie => movie.genre).map(movie => movie.genre))
  ).filter(Boolean) as string[];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold">My Top 100 Movies</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSortDirection}
              className="flex gap-1 items-center"
            >
              Sort {sortDirection === 'asc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetRankings}>
              Reset Rankings
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Genres</SelectItem>
                {uniqueGenres.map((genre) => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Drag and drop movies to reorder. Click the star icon to add to favorites. Click the edit icon to modify titles.
      </p>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lg">Loading movie data...</p>
        </div>
      ) : filteredMovies.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="movie-list">
            {(provided) => (
              <div
                className="movie-list"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {filteredMovies.map((movie, index) => (
                  <Draggable 
                    key={movie.id.toString()} 
                    draggableId={movie.id.toString()} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="animate-fade-in"
                        style={{ 
                          animationDelay: `${index * 25}ms`, 
                          ...provided.draggableProps.style 
                        }}
                      >
                        <MovieCard
                          movie={movie}
                          isDragging={snapshot.isDragging}
                          dragHandleProps={provided.dragHandleProps}
                          onToggleFavorite={handleToggleFavorite}
                          onEditMovie={handleEditMovie}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg">No movies found matching your criteria.</p>
          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setSelectedGenre('all');
          }} className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}

      <MovieEditDialog 
        movie={editingMovie}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingMovie(null);
        }}
        onSave={handleSaveMovieTitle}
      />
    </div>
  );
};

export default MovieList;
