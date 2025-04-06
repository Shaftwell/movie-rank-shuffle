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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MovieListProps {
  initialMovies: Movie[];
}

// Movies per page
const MOVIES_PER_PAGE = 20;

// TMDB API base URL for images
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w200";

const MovieList = ({ initialMovies }: MovieListProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
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
          // Special case for "The Thomas Crown Affair" - specify it's the 1999 version
          const searchQuery = movie.title === "The Thomas Crown Affair" 
            ? "The Thomas Crown Affair 1999" 
            : movie.title;
          
          // Search for the movie to get TMDB ID
          const searchResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=2dca580c2a14b55200e784d157207b4d&query=${encodeURIComponent(searchQuery)}&include_adult=false`
          );
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

  // Pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * MOVIES_PER_PAGE;
    const endIndex = startIndex + MOVIES_PER_PAGE;
    setDisplayedMovies(filteredMovies.slice(startIndex, endIndex));
  }, [filteredMovies, currentPage]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedGenre]);

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

    // Create a copy of displayed movies
    const newDisplayedMovies = Array.from(displayedMovies);
    // Remove the moved item from the array
    const [removed] = newDisplayedMovies.splice(source.index, 1);
    // Insert it at the new position
    newDisplayedMovies.splice(destination.index, 0, removed);

    // Update ranks based on new positions for displayed movies
    const rankedDisplayedMovies = newDisplayedMovies.map((movie, index) => ({
      ...movie,
      rank: (currentPage - 1) * MOVIES_PER_PAGE + index + 1,
    }));

    // Update all movies with the new rankings
    const updatedMovies = movies.map(movie => {
      const updatedMovie = rankedDisplayedMovies.find(m => m.id === movie.id);
      if (updatedMovie) {
        return updatedMovie;
      }
      return movie;
    });

    setDisplayedMovies(rankedDisplayedMovies);
    setMovies(updatedMovies);
    
    toast({
      title: "Movie Ranking Updated",
      description: `"${removed.title}" is now ranked #${destination.index + 1 + ((currentPage - 1) * MOVIES_PER_PAGE)}`,
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
        favorite: existingMovie?.favorite || false,
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
      // Special case for "The Thomas Crown Affair" - specify it's the 1999 version
      const searchQuery = newTitle === "The Thomas Crown Affair" 
        ? "The Thomas Crown Affair 1999" 
        : newTitle;
      
      // Search for the movie to get TMDB ID
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=2dca580c2a14b55200e784d157207b4d&query=${encodeURIComponent(searchQuery)}&include_adult=false`
      );
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

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  
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
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="movie-list">
              {(provided) => (
                <div
                  className="movie-list"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {displayedMovies.map((movie, index) => (
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

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }} 
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Create a window of pages around the current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
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
