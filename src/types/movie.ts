
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
  director?: string;
  actors?: string[];
}

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  genre_ids: number[];
  overview?: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  genre_ids: number[];
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
    }>;
  };
}

// Local storage key for saving movie data
export const MOVIES_STORAGE_KEY = 'movieRankShuffleData';

// Sorting options
export type SortOption = 'rank' | 'title-asc' | 'title-desc' | 'year' | 'rating';
