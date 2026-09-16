import React from 'react';
import MovieFilters from './MovieFilters';
import MovieSortControls from './MovieSortControls';
import DraggableMovieList from './DraggableMovieList';
import MovieEditDialog from './MovieEditDialog';
import ShareDialog from './ShareDialog';
import { useMovieData } from '@/hooks/useMovieData';
import { Movie } from '@/types/movie';
import { Skeleton } from '@/components/ui/skeleton';

interface MovieListProps {
  initialMovies: Movie[];
}

const MovieList = ({ initialMovies }: MovieListProps) => {
  const {
    movies,
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
    handleSelectTMDBMovie,
    resetLocalStorage,
    setIsEditDialogOpen,
    setEditingMovie,
    clearFilters,
    importRankings,
  } = useMovieData(initialMovies);

  return (
    <div className="bg-gradient-to-b from-background via-background to-background/95">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <p className="text-muted-foreground text-sm md:text-base">
              Drag to rerank. Search and filter without resetting the rest of the list.
            </p>
            <div className="flex flex-wrap gap-2">
              <ShareDialog movies={movies} onImportRankings={importRankings} />
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

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-full h-44 rounded-xl" />
            ))}
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
      </div>
    </div>
  );
};

export default MovieList;
