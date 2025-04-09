
import React from 'react';
import { Movie } from '@/types/movie';
import { cn } from '@/lib/utils';
import { Film, Calendar, Percent, Edit, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MovieCardProps {
  movie: Movie;
  isDragging: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onEditMovie?: (id: number) => void;
  onToggleWatched?: (id: number) => void;
}

const MovieCard = ({ 
  movie, 
  isDragging, 
  dragHandleProps, 
  onEditMovie,
  onToggleWatched
}: MovieCardProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditMovie) {
      onEditMovie(movie.id);
    }
  };

  const handleWatchedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWatched) {
      onToggleWatched(movie.id);
    }
  };

  return (
    <div
      className={cn(
        "movie-card flex items-center",
        isDragging && "movie-dragging",
        movie.watched && "bg-muted/30"
      )}
      {...dragHandleProps}
    >
      <div className="movie-rank-container flex-shrink-0 w-16 flex justify-center items-center">
        <div className="movie-rank">{movie.rank}</div>
      </div>
      
      {movie.imageUrl && (
        <div className="movie-poster w-16 h-24 flex-shrink-0 rounded overflow-hidden border mr-4">
          <AspectRatio ratio={2/3}>
            <img 
              src={movie.imageUrl} 
              alt={`${movie.title} poster`}
              className={cn("object-cover w-full h-full", movie.watched && "opacity-80")}
            />
          </AspectRatio>
        </div>
      )}
      
      <div className="movie-card-content flex-grow flex justify-between items-center">
        <div className="movie-info">
          <HoverCard>
            <HoverCardTrigger asChild>
              <h3 className={cn(
                "text-lg font-semibold truncate max-w-[60vw] md:max-w-[40vw] cursor-pointer",
                movie.watched && "text-muted-foreground line-through decoration-1"
              )}>
                {movie.title}
              </h3>
            </HoverCardTrigger>
            <HoverCardContent className="movie-hover-card">
              <div className="flex flex-col gap-2">
                <h4 className={cn(
                  "font-bold text-xl",
                  movie.watched && "text-muted-foreground line-through decoration-1"
                )}>
                  {movie.title}
                  {movie.watched && <span className="text-primary text-sm ml-2 no-underline">(Watched)</span>}
                </h4>
                
                <div className="flex flex-wrap gap-y-2">
                  {movie.imageUrl && (
                    <div className="w-1/3 pr-2 flex-shrink-0">
                      <AspectRatio ratio={2/3}>
                        <img 
                          src={movie.imageUrl} 
                          alt={`${movie.title} poster`}
                          className={cn("object-cover w-full h-full rounded", movie.watched && "opacity-80")}
                        />
                      </AspectRatio>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 flex-grow">
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
                    {movie.rottenTomatoesScore !== undefined && (
                      <div className="flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        <span className={cn(
                          movie.rottenTomatoesScore >= 60 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                          "font-medium"
                        )}>
                          {movie.rottenTomatoesScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          
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
            {movie.rottenTomatoesScore !== undefined && (
              <span className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                <span className={cn(
                  movie.rottenTomatoesScore >= 60 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400", 
                  "font-medium"
                )}>
                  {movie.rottenTomatoesScore}%
                </span>
              </span>
            )}
          </div>
        </div>
        
        <div className="movie-actions flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleWatchedClick}
                  className="watched-button p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  {movie.watched ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {movie.watched ? "Mark as unwatched" : "Mark as watched"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleEditClick}
                  className="edit-button p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Edit movie title
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
