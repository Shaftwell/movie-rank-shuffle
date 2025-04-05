
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import MovieCard from './MovieCard';
import { Movie } from '@/types/movie';
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

// Array of common movie genres
const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", 
  "Drama", "Fantasy", "Horror", "Mystery", "Romance", 
  "Sci-Fi", "Thriller", "Western"
];

// Movies per page
const MOVIES_PER_PAGE = 20;

const MovieList = ({ initialMovies }: MovieListProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();

  // Initialize movies with sample data
  useEffect(() => {
    const moviesWithDetails = initialMovies.map(movie => {
      // Simulate movie details with random years and genres
      const randomYear = Math.floor(Math.random() * 40) + 1984; // Random year between 1984-2023
      const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
      
      return {
        ...movie,
        year: randomYear,
        genre: randomGenre,
        favorite: false
      };
    });
    
    setMovies(moviesWithDetails);
  }, [initialMovies]);

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
    if (selectedGenre) {
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

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);

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
                <SelectItem value="">All Genres</SelectItem>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Drag and drop movies to reorder. Click the star icon to add to favorites.
      </p>

      {filteredMovies.length > 0 ? (
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
            setSelectedGenre('');
          }} className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default MovieList;
