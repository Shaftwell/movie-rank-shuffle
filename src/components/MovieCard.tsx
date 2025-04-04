
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
      className={cn("movie-card", isDragging && "movie-dragging")}
      {...dragHandleProps}
    >
      <div className="movie-rank">{movie.rank}</div>
      <div className="movie-card-content pl-28">
        <h3 className="text-lg font-semibold">{movie.title}</h3>
      </div>
    </div>
  );
};

export default MovieCard;
