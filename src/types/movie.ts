export interface Movie {
  id: number;
  title: string;
  rank: number;
  year?: number;
  searchYear?: number;
  genre?: string;
  imageUrl?: string;
  tmdbScore?: number;
  /** @deprecated Use tmdbScore. Kept so existing localStorage data still works. */
  rottenTomatoesScore?: number;
  isEditing?: boolean;
  director?: string;
  actors?: string[];
}

export function getMovieScore(movie: Movie): number | undefined {
  return movie.tmdbScore ?? movie.rottenTomatoesScore;
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

export const MOVIES_STORAGE_KEY = 'movieRankShuffleData';

export type SortOption = 'rank' | 'title-asc' | 'title-desc' | 'year' | 'rating';
