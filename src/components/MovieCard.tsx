
import React from 'react';
import { Movie } from '@/types/movie';
import { cn } from '@/lib/utils';
import { Film, Calendar, Percent, Edit, Eye, EyeOff, User, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg cursor-move",
        isDragging && "opacity-70 rotate-2 shadow-xl",
        movie.watched && "bg-muted/30"
      )}
      {...dragHandleProps}
    >
      <CardContent className="p-0">
        <div className="flex items-center min-h-[140px]">
          {/* Rank */}
          <div className="flex-shrink-0 w-20 flex justify-center items-center p-4">
            <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-sm">
              {movie.rank}
            </div>
          </div>
          
          {/* Poster */}
          {movie.imageUrl && (
            <div className="w-20 h-28 flex-shrink-0 rounded-md overflow-hidden border mr-4 shadow-sm">
              <AspectRatio ratio={2/3}>
                <img 
                  src={movie.imageUrl} 
                  alt={`${movie.title} poster`}
                  className={cn("object-cover w-full h-full", movie.watched && "opacity-70")}
                />
              </AspectRatio>
            </div>
          )}
          
          {/* Movie Info */}
          <div className="flex-grow flex justify-between items-center p-4">
            <div className="flex-grow pr-4">
              <h3 className={cn(
                "text-lg font-semibold mb-2 leading-tight",
                movie.watched && "text-muted-foreground line-through decoration-1"
              )}>
                {movie.title}
                {movie.watched && <span className="text-primary text-sm ml-2 no-underline">(Watched)</span>}
              </h3>
              
              {/* Metadata Row */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
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
              
              {/* Director */}
              {movie.director && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Director: {movie.director}</span>
                </div>
              )}
              
              {/* Cast */}
              {movie.actors && movie.actors.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Cast: {movie.actors.join(', ')}</span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleWatchedClick}
                      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
                      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Edit movie
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
