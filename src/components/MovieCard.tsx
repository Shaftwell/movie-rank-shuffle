
import React from 'react';
import { Movie } from '@/types/movie';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  isDragging: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const MovieCard = ({ movie, isDragging, dragHandleProps }: MovieCardProps) => {
  return (
    <div
      className={cn(
        "movie-card flex items-center",
        isDragging && "movie-dragging"
      )}
      {...dragHandleProps}
    >
      <div className="movie-rank-container flex-shrink-0 w-20 flex justify-center items-center">
        <div className="movie-rank">{movie.rank}</div>
      </div>
      <div className="movie-card-content flex-grow">
        <h3 className="text-lg font-semibold truncate">{movie.title}</h3>
      </div>
    </div>
  );
};

export default MovieCard;
