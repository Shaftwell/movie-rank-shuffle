
import React from 'react';
import MovieFilters from './MovieFilters';
import MovieSortControls from './MovieSortControls';
import DraggableMovieList from './DraggableMovieList';
import MovieEditDialog from './MovieEditDialog';
import SocialShareDialog from './SocialShareDialog';
import { useMovieData } from '@/hooks/useMovieData';
import { Movie } from '@/types/movie';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface MovieListProps {
  initialMovies: Movie[];
}

const MovieList = ({ initialMovies }: MovieListProps) => {
  const {
    filteredMovies,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedGenre,
    setSelectedGenre,
    sortOption,
    sortDirection,
    uniqueGenres,
    editingMovie,
    isEditDialogOpen,
    isSocialShareDialogOpen,
    setIsSocialShareDialogOpen,
    handleDragEnd,
    resetRankings,
    toggleSortDirection,
    handleSortOptionChange,
    handleEditMovie,
    handleSaveMovieTitle,
    handleSelectTMDBMovie,
    resetLocalStorage,
    setIsEditDialogOpen,
    setEditingMovie,
    clearFilters
  } = useMovieData(initialMovies);

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => setIsSocialShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <MovieSortControls
              sortOption={sortOption}
              sortDirection={sortDirection}
              onSortOptionChange={handleSortOptionChange}
              toggleSortDirection={toggleSortDirection}
              resetRankings={resetRankings}
              resetLocalStorage={resetLocalStorage}
            />
          </div>
        </div>
        
        <MovieFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          uniqueGenres={uniqueGenres}
        />
      </div>
      
      <p className="text-muted-foreground mb-8 italic text-sm">
        Drag and drop movies to reorder. Click the edit icon to modify titles or search TMDB for correct movie information.
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-4 py-8">
          <Skeleton className="w-full h-20" />
          <Skeleton className="w-full h-20" />
          <Skeleton className="w-full h-20" />
          <Skeleton className="w-full h-20" />
        </div>
      ) : (
        <DraggableMovieList
          movies={filteredMovies}
          onDragEnd={handleDragEnd}
          onEditMovie={handleEditMovie}
          clearFilters={clearFilters}
        />
      )}

      <MovieEditDialog 
        movie={editingMovie}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingMovie(null);
        }}
        onSave={handleSaveMovieTitle}
        onSelectTMDBMovie={handleSelectTMDBMovie}
      />

      <SocialShareDialog 
        isOpen={isSocialShareDialogOpen} 
        onClose={() => setIsSocialShareDialogOpen(false)} 
        movies={filteredMovies.slice(0, 20)} 
      />
    </div>
  );
};

export default MovieList;
