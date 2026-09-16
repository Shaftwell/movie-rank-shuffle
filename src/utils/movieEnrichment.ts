import { Movie, TMDBMovie, TMDBGenre } from '@/types/movie';
import {
  fetchMovieDetails,
  extractDirectorAndActors,
  TMDB_POSTER_URL,
} from '@/services/tmdbService';

export async function enrichMovieWithTMDB(
  movie: Movie,
  tmdbMovie: TMDBMovie,
  genres: TMDBGenre[]
): Promise<Movie> {
  const movieDetails = await fetchMovieDetails(tmdbMovie.id);
  const tmdbScore = Math.round(tmdbMovie.vote_average * 10);

  const genreName =
    tmdbMovie.genre_ids.length > 0 && genres.length > 0
      ? genres.find((g) => g.id === tmdbMovie.genre_ids[0])?.name
      : undefined;

  const year = tmdbMovie.release_date
    ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
    : undefined;

  const imageUrl = tmdbMovie.poster_path
    ? `${TMDB_POSTER_URL}${tmdbMovie.poster_path}`
    : undefined;

  let director: string | undefined;
  let actors: string[] = [];

  if (movieDetails) {
    const extracted = extractDirectorAndActors(movieDetails);
    director = extracted.director;
    actors = extracted.actors;
  }

  return {
    ...movie,
    year,
    genre: genreName,
    tmdbScore,
    imageUrl,
    director,
    actors,
  };
}

export const enrichMovieWithBasicTMDB = enrichMovieWithTMDB;
