
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import MovieCard from './MovieCard';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface MovieListProps {
  initialMovies: Movie[];
}

const MovieList = ({ initialMovies }: MovieListProps) => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const { toast } = useToast();

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

    // Create a copy of movies
    const newMovies = Array.from(movies);
    // Remove the moved item from the array
    const [removed] = newMovies.splice(source.index, 1);
    // Insert it at the new position
    newMovies.splice(destination.index, 0, removed);

    // Update ranks based on new positions
    const rankedMovies = newMovies.map((movie, index) => ({
      ...movie,
      rank: index + 1,
    }));

    setMovies(rankedMovies);
    
    toast({
      title: "Movie Ranking Updated",
      description: `"${removed.title}" is now ranked #${destination.index + 1}`,
      duration: 2000,
    });
  };

  const resetRankings = () => {
    const sortedMovies = [...initialMovies].sort((a, b) => a.id - b.id);
    const resetMovies = sortedMovies.map((movie, index) => ({
      ...movie,
      rank: index + 1,
    }));
    setMovies(resetMovies);
    
    toast({
      title: "Rankings Reset",
      description: "All movies have been returned to their original order.",
      duration: 2000,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Top 100 Movies</h2>
        <Button variant="outline" onClick={resetRankings}>
          Reset Rankings
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Drag and drop movies to reorder your rankings. Your changes are saved automatically.
      </p>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="movie-list">
          {(provided) => (
            <div
              className="movie-list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {movies.map((movie, index) => (
                <Draggable key={movie.id.toString()} draggableId={movie.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 25}ms`, ...provided.draggableProps.style }}
                    >
                      <MovieCard
                        movie={movie}
                        isDragging={snapshot.isDragging}
                        dragHandleProps={provided.dragHandleProps}
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
    </div>
  );
};

export default MovieList;
