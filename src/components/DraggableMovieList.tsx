
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import MovieCard from './MovieCard';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';

interface DraggableMovieListProps {
  movies: Movie[];
  onDragEnd: (result: DropResult) => void;
  onEditMovie: (id: number) => void;
  clearFilters: () => void;
}

const DraggableMovieList = React.memo(({
  movies,
  onDragEnd,
  onEditMovie,
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
      <Droppable droppableId="movies">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4"
          >
            {movies.map((movie, index) => (
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
                      onEditMovie={onEditMovie}
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
  );
});

DraggableMovieList.displayName = 'DraggableMovieList';

export default DraggableMovieList;
