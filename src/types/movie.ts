
export interface Movie {
  id: number;
  title: string;
  rank: number;
  year?: number;
  genre?: string;
  favorite?: boolean;
  imageUrl?: string;
  rottenTomatoesScore?: number;
  isEditing?: boolean;
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
