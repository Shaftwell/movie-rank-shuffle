
import { TMDBMovie, TMDBGenre, TMDBMovieDetails } from '@/types/movie';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w200";

// Special cases for remakes - map movie titles to specific search queries with years
export const SPECIAL_CASES: Record<string, { query: string, year?: number }> = {
  "The Thomas Crown Affair (1999)": { query: "The Thomas Crown Affair", year: 1999 },
  "Bloodsport (1988)": { query: "Bloodsport", year: 1988 },
  "Sherlock Holmes (2009)": { query: "Sherlock Holmes", year: 2009 },
  "Ocean's Eleven": { query: "Ocean's Eleven", year: 2001 },
  "Parasite (기생충)": { query: "Parasite Gisaengchung", year: 2019 },
  "Up (2009)": { query: "Up Pixar", year: 2009 },
  "Gladiator": { query: "Gladiator Russell Crowe", year: 2000 },
};

export const fetchGenres = async (): Promise<TMDBGenre[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const searchMovie = async (title: string, searchYear?: number): Promise<TMDBMovie | null> => {
  try {
    const specialCase = SPECIAL_CASES[title];
    let searchQuery = title;
    let year = searchYear;
    
    if (specialCase) {
      searchQuery = specialCase.query;
      year = specialCase.year;
      console.log(`Using special case for ${title}: query=${searchQuery}, year=${year}`);
    }
    
    let searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&include_adult=false`;
    
    if (year) {
      searchUrl += `&year=${year}`;
    }
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.results && searchData.results.length > 0) {
      return searchData.results[0] as TMDBMovie;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching movie:', error);
    return null;
  }
};

export const fetchMovieDetails = async (movieId: number): Promise<TMDBMovieDetails | null> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );
    const data = await response.json();
    return data as TMDBMovieDetails;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export const extractDirectorAndActors = (movieDetails: TMDBMovieDetails) => {
  const director = movieDetails.credits?.crew?.find(
    (person) => person.job === 'Director'
  )?.name;
  
  const actors = movieDetails.credits?.cast
    ?.slice(0, 3) // Get top 3 actors
    ?.map((actor) => actor.name) || [];
  
  return { director, actors };
};
