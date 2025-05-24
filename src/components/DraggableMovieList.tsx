
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import MovieCard from './MovieCard';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';

interface DraggableMovieListProps {
  movies: Movie[];
  onDragEnd: (result: DropResult) => void;
  onEditMovie: (id: number) => void;
  onToggleWatched: (id: number) => void;
  clearFilters: () => void;
}

const DraggableMovieList = ({ 
  movies, 
  onDragEnd,
  onEditMovie,
  onToggleWatched,
  clearFilters
}: DraggableMovieListProps) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg">No movies found matching your criteria.</p>
        <Button variant="outline" onClick={clearFilters} className="mt-4">
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="movie-list">
        {(provided) => (
          <div
            className="movie-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {movies.map((movie, index) => {
              console.log(`Movie ${movie.title}:`, {
                director: movie.director,
                actors: movie.actors,
                hasDirector: !!movie.director,
                hasActors: !!movie.actors && movie.actors.length > 0
              });
              
              return (
                <Draggable 
                  key={`movie-${movie.id}`} 
                  draggableId={`movie-${movie.id}`} 
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
                        onEditMovie={onEditMovie}
                        onToggleWatched={onToggleWatched}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableMovieList;
