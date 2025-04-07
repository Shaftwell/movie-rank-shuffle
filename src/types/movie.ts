
export interface Movie {
  id: number;
  title: string;
  rank: number;
  year?: number;
  searchYear?: number; // Add this field to specify a year for search
  genre?: string;
  imageUrl?: string;
  rottenTomatoesScore?: number;
  isEditing?: boolean;
  tmdbId?: number; // Add TMDB ID for direct linking
}

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

// Local storage key for saving movie data
export const MOVIES_STORAGE_KEY = 'top25MovieRankData';

// Sorting options
export type SortOption = 'rank' | 'title-asc' | 'title-desc' | 'year' | 'rating';
