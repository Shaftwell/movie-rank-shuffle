import { Movie, TMDBMovie, TMDBGenre, TMDBMovieDetails } from '@/types/movie';
import {
  fetchMovieDetails,
  extractDirectorAndActors,
  TMDB_IMAGE_URL
} from '@/services/tmdbService';

/**
 * Enriches a movie with TMDB data including year, genre, rating, image, director, and actors
 */
export async function enrichMovieWithTMDB(
  movie: Movie,
  tmdbMovie: TMDBMovie,
  genres: TMDBGenre[]
): Promise<Movie> {
  const movieDetails = await fetchMovieDetails(tmdbMovie.id);
  const rottenTomatoesScore = Math.round(tmdbMovie.vote_average * 10);

  const genreName = tmdbMovie.genre_ids.length > 0 && genres.length > 0
    ? genres.find(g => g.id === tmdbMovie.genre_ids[0])?.name
    : undefined;

  const year = tmdbMovie.release_date
    ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
    : undefined;

  const imageUrl = tmdbMovie.poster_path
    ? `${TMDB_IMAGE_URL}${tmdbMovie.poster_path}`
    : undefined;

  let director: string | undefined;
  let actors: string[] = [];

  if (movieDetails) {
    const { director: extractedDirector, actors: extractedActors } = extractDirectorAndActors(movieDetails);
    director = extractedDirector;
    actors = extractedActors;
  }

  return {
    ...movie,
    year,
    genre: genreName,
    rottenTomatoesScore,
    imageUrl,
    director,
    actors,
  };
}

/**
 * Enriches movie with basic TMDB data including director and actors
 */
export async function enrichMovieWithBasicTMDB(
  movie: Movie,
  tmdbMovie: TMDBMovie,
  genres: TMDBGenre[]
): Promise<Movie> {
  const movieDetails = await fetchMovieDetails(tmdbMovie.id);
  const rottenTomatoesScore = Math.round(tmdbMovie.vote_average * 10);

  const genreName = tmdbMovie.genre_ids.length > 0 && genres.length > 0
    ? genres.find(g => g.id === tmdbMovie.genre_ids[0])?.name
    : undefined;

  const year = tmdbMovie.release_date
    ? parseInt(tmdbMovie.release_date.split('-')[0], 10)
    : undefined;

  const imageUrl = tmdbMovie.poster_path
    ? `${TMDB_IMAGE_URL}${tmdbMovie.poster_path}`
    : undefined;

  let director: string | undefined;
  let actors: string[] = [];

  if (movieDetails) {
    const { director: extractedDirector, actors: extractedActors } = extractDirectorAndActors(movieDetails);
    director = extractedDirector;
    actors = extractedActors;
  }

  return {
    ...movie,
    year,
    genre: genreName,
    rottenTomatoesScore,
    imageUrl,
    director,
    actors,
  };
}
