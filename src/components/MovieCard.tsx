
import React from 'react';
import { Movie } from '@/types/movie';
import { cn } from '@/lib/utils';
import { Star, Film, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface MovieCardProps {
  movie: Movie;
  isDragging: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onToggleFavorite?: (id: number) => void;
}

const MovieCard = ({ 
  movie, 
  isDragging, 
  dragHandleProps, 
  onToggleFavorite 
}: MovieCardProps) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(movie.id);
    }
  };

  return (
    <div
      className={cn(
        "movie-card flex items-center",
        isDragging && "movie-dragging",
        movie.favorite && "movie-favorite"
      )}
      {...dragHandleProps}
    >
      <div className="movie-rank-container flex-shrink-0 w-20 flex justify-center items-center">
        <div className="movie-rank">{movie.rank}</div>
      </div>
      <div className="movie-card-content flex-grow flex justify-between items-center">
        <div className="movie-info">
          <HoverCard>
            <HoverCardTrigger asChild>
              <h3 className="text-lg font-semibold truncate max-w-[60vw] md:max-w-[40vw] cursor-pointer">
                {movie.title}
              </h3>
            </HoverCardTrigger>
            <HoverCardContent className="movie-hover-card">
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-xl">{movie.title}</h4>
                {movie.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{movie.year}</span>
                  </div>
                )}
                {movie.genre && (
                  <div className="flex items-center gap-1">
                    <Film className="h-4 w-4" />
                    <span>{movie.genre}</span>
                  </div>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
          
          {(movie.year || movie.genre) && (
            <div className="movie-meta text-sm text-muted-foreground flex items-center gap-2">
              {movie.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {movie.year}
                </span>
              )}
              {movie.genre && (
                <span className="flex items-center gap-1">
                  <Film className="h-3 w-3" />
                  {movie.genre}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="movie-actions">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleFavoriteClick}
                  className={cn(
                    "favorite-button p-1 rounded-full", 
                    movie.favorite ? "text-yellow-400" : "text-muted-foreground"
                  )}
                >
                  <Star className="h-5 w-5" fill={movie.favorite ? "currentColor" : "none"} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {movie.favorite ? "Remove from favorites" : "Add to favorites"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
