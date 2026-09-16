import { TMDBMovie, TMDBGenre, TMDBMovieDetails } from '@/types/movie';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w200';
export const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w500';

const searchCache = new Map<string, TMDBMovie[]>();

export const SPECIAL_CASES: Record<string, { query: string; year?: number }> = {
  'The Thomas Crown Affair (1999)': { query: 'The Thomas Crown Affair', year: 1999 },
  'Bloodsport (1988)': { query: 'Bloodsport', year: 1988 },
  'Sherlock Holmes (2009)': { query: 'Sherlock Holmes', year: 2009 },
  "Ocean's Eleven": { query: "Ocean's Eleven", year: 2001 },
  'Parasite (기생충)': { query: 'Parasite Gisaengchung', year: 2019 },
  'Up (2009)': { query: 'Up Pixar', year: 2009 },
  Gladiator: { query: 'Gladiator Russell Crowe', year: 2000 },
};

export function isTmdbConfigured(): boolean {
  return Boolean(TMDB_API_KEY);
}

function requireApiKey(): string {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not configured. Set VITE_TMDB_API_KEY.');
  }
  return TMDB_API_KEY;
}

export async function mapPool<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await mapper(items[index], index);
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

export const fetchGenres = async (): Promise<TMDBGenre[]> => {
  try {
    const apiKey = requireApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`
    );
    if (!response.ok) throw new Error(`Genre request failed: ${response.status}`);
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const searchMovies = async (
  title: string,
  searchYear?: number | string
): Promise<TMDBMovie[]> => {
  const apiKey = requireApiKey();
  const specialCase = SPECIAL_CASES[title];
  const searchQuery = specialCase?.query ?? title;
  const year = searchYear || specialCase?.year;
  const cacheKey = `${searchQuery}::${year ?? ''}`;

  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  let searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
  if (year) searchUrl += `&year=${year}`;

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    throw new Error(`Search failed: ${searchResponse.status}`);
  }
  const searchData = await searchResponse.json();
  const results = (searchData.results || []) as TMDBMovie[];
  searchCache.set(cacheKey, results);
  return results;
};

export const searchMovie = async (
  title: string,
  searchYear?: number
): Promise<TMDBMovie | null> => {
  try {
    const results = await searchMovies(title, searchYear);
    return results[0] ?? null;
  } catch (error) {
    console.error('Error searching movie:', error);
    return null;
  }
};

export const fetchMovieDetails = async (movieId: number): Promise<TMDBMovieDetails | null> => {
  try {
    const apiKey = requireApiKey();
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`
    );
    if (!response.ok) throw new Error(`Details request failed: ${response.status}`);
    return (await response.json()) as TMDBMovieDetails;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export const extractDirectorAndActors = (movieDetails: TMDBMovieDetails) => {
  const director = movieDetails.credits?.crew?.find((person) => person.job === 'Director')?.name;
  const actors =
    movieDetails.credits?.cast?.slice(0, 3)?.map((actor) => actor.name) || [];
  return { director, actors };
};
