import React from 'react';
import { Movie } from '@/types/movie';
import { cn } from '@/lib/utils';
import { Film, Calendar, Edit, User, Star, StarHalf, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

interface MovieCardProps {
  movie: Movie;
  isDragging: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onEditMovie?: (id: number) => void;
}

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 >= 1;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <StarHalf key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      );
    } else {
      stars.push(
        <Star key={i} className="h-3.5 w-3.5 text-muted-foreground/30" />
      );
    }
  }

  return <div className="flex gap-0.5">{stars}</div>;
};

const MovieCard = React.memo(({
  movie,
  isDragging,
  dragHandleProps,
  onEditMovie
}: MovieCardProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditMovie) {
      onEditMovie(movie.id);
    }
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-move border-muted/40",
        "hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 hover:scale-[1.01]",
        isDragging && "opacity-70 scale-95 shadow-2xl rotate-1"
      )}
      {...dragHandleProps}
    >
      <div className="flex items-stretch min-h-[180px] sm:min-h-[200px] relative overflow-hidden">
        {/* Rank Badge */}
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg px-3 py-1.5 font-bold text-base shadow-lg backdrop-blur-sm border border-primary-foreground/20">
            #{movie.rank}
          </div>
        </div>

        {/* Poster with Gradient Overlay */}
        <div className="relative w-32 sm:w-40 md:w-48 flex-shrink-0 overflow-hidden">
          {movie.imageUrl ? (
            <>
              <img
                src={movie.imageUrl.replace('w200', 'w500')}
                alt={`${movie.title} poster`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <Film className="h-12 w-12 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 md:p-6 min-w-0">
          <div className="flex-1">
            {/* Title */}
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 leading-tight line-clamp-2">
              {movie.title}
            </h3>

            {/* Year and Genre */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
              {movie.year && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {movie.year}
                </span>
              )}
              {movie.genre && (
                <span className="flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5" />
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {movie.genre}
                  </span>
                </span>
              )}
            </div>

            {/* Rating */}
            {movie.rottenTomatoesScore !== undefined && (
              <div className="flex items-center gap-3 mb-3">
                <StarRating rating={movie.rottenTomatoesScore / 10} />
                <span className={cn(
                  "text-sm font-bold",
                  movie.rottenTomatoesScore >= 70 ? "text-green-600 dark:text-green-400" :
                  movie.rottenTomatoesScore >= 50 ? "text-yellow-600 dark:text-yellow-400" :
                  "text-red-600 dark:text-red-400"
                )}>
                  {(movie.rottenTomatoesScore / 10).toFixed(1)}
                </span>
              </div>
            )}

            {/* Director */}
            {movie.director && (
              <div className="flex items-start gap-2 text-sm mb-2.5">
                <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/70" />
                <div className="min-w-0">
                  <span className="text-muted-foreground/80 text-xs">Director</span>
                  <p className="font-semibold text-foreground line-clamp-1">{movie.director}</p>
                </div>
              </div>
            )}

            {/* Cast */}
            {movie.actors && movie.actors.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/70" />
                <div className="min-w-0">
                  <span className="text-muted-foreground/80 text-xs">Cast</span>
                  <p className="font-medium text-foreground/90 line-clamp-1">{movie.actors.join(', ')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-muted/30">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Edit movie details
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Card>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;
