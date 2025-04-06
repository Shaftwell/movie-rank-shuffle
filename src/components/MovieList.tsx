
import React from 'react';
import MovieFilters from './MovieFilters';
import MovieSortControls from './MovieSortControls';
import DraggableMovieList from './DraggableMovieList';
import MovieEditDialog from './MovieEditDialog';
import { useMovieData } from '@/hooks/useMovieData';
import { Movie } from '@/types/movie';
import { Skeleton } from '@/components/ui/skeleton';

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
    handleDragEnd,
    resetRankings,
    toggleSortDirection,
    handleSortOptionChange,
    handleEditMovie,
    handleSaveMovieTitle,
    resetLocalStorage,
    setIsEditDialogOpen,
    setEditingMovie,
    clearFilters
  } = useMovieData(initialMovies);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold">My Top 100 Movies</h2>
          <MovieSortControls
            sortOption={sortOption}
            sortDirection={sortDirection}
            onSortOptionChange={handleSortOptionChange}
            toggleSortDirection={toggleSortDirection}
            resetRankings={resetRankings}
            resetLocalStorage={resetLocalStorage}
          />
        </div>
        
        <MovieFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          uniqueGenres={uniqueGenres}
        />
      </div>
      
      <p className="text-muted-foreground mb-6">
        Drag and drop movies to reorder. Click the edit icon to modify titles.
        Your changes are saved automatically.
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
      />
    </div>
  );
};

export default MovieList;
