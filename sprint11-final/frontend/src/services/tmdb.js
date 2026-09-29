import {
  setMovieCertificationCache,
  getMovieCertificationCache,
  setMovieKeywordCache,
  getMovieKeywordCache,
  fetchMovieReleaseDates,
  fetchMovieKeywords,
  isCertificationAllowed,
  isKeywordsAllowed,
  isMovieAllowed,
} from '../utils/safety.js';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * Check if a valid TMDB API key is configured in the environment
 * @returns {boolean}
 */
export function hasTmdbApiKey() {
  const envKey = import.meta.env.VITE_TMDB_KEY;
  return Boolean(envKey && envKey.trim() !== '' && envKey !== 'your_tmdb_api_key_here');
}

/**
 * Retrieve TMDB API key from Vite environment
 * @returns {string}
 */
export function getTmdbApiKey() {
  const envKey = import.meta.env.VITE_TMDB_KEY;
  if (hasTmdbApiKey()) {
    return envKey.trim();
  }
  throw new Error(
    'TMDB API key is not configured. Add VITE_TMDB_KEY to the environment and restart the application.'
  );
}

/**
 * Construct full image poster URL with fallback protection
 * @param {string|null} posterPath 
 * @returns {string}
 */
export function getPosterUrl(posterPath) {
  if (!posterPath || typeof posterPath !== 'string') {
    return '/placeholder-poster.svg';
  }
  if (posterPath.startsWith('http')) {
    return posterPath;
  }
  return `${IMAGE_BASE_URL}${posterPath}`;
}

/**
 * Format release date to 4-digit year
 * @param {string} releaseDate 
 * @returns {string}
 */
export function formatReleaseYear(releaseDate) {
  if (!releaseDate || typeof releaseDate !== 'string') {
    return 'N/A';
  }
  const year = releaseDate.substring(0, 4);
  return year && !isNaN(Number(year)) ? year : 'N/A';
}

/**
 * Format vote average rating with one decimal point
 * @param {number|string} voteAverage 
 * @returns {string}
 */
export function formatRating(voteAverage) {
  if (voteAverage === undefined || voteAverage === null || isNaN(Number(voteAverage))) {
    return 'NR';
  }
  const num = Number(voteAverage);
  return num > 0 ? num.toFixed(1) : 'NR';
}

/**
 * Fetch Popular Movies page from TMDB
 * @param {number} page Page number (1-indexed)
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<{ results: Array, page: number, total_pages: number, total_results: number }>}
 */
export async function getPopularMovies(page = 1, signal = null) {
  const apiKey = getTmdbApiKey();
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=${page}&include_adult=false`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid TMDB API key. Please check your VITE_TMDB_KEY configuration.');
      }
      if (response.status === 404) {
        throw new Error('Requested movies endpoint not found.');
      }
      throw new Error(`TMDB API Error (${response.status}): Failed to retrieve popular movies.`);
    }

    const data = await response.json();
    return {
      results: Array.isArray(data.results) ? data.results : [],
      page: data.page || page,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('getPopularMovies failed:', error);
    throw error;
  }
}

/**
 * Search movies by query on TMDB
 * @param {string} query Search keyword
 * @param {number} page Page number (1-indexed)
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<{ results: Array, page: number, total_pages: number, total_results: number }>}
 */
export async function searchMovies(query, page = 1, signal = null) {
  const cleanQuery = query ? query.trim() : '';
  if (!cleanQuery) {
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }

  const apiKey = getTmdbApiKey();
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
    cleanQuery
  )}&page=${page}&include_adult=false`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid TMDB API key. Please check your VITE_TMDB_KEY configuration.');
      }
      throw new Error(`TMDB Search Error (${response.status}): Unable to execute search.`);
    }

    const data = await response.json();
    return {
      results: Array.isArray(data.results) ? data.results : [],
      page: data.page || page,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('searchMovies failed:', error);
    throw error;
  }
}

/**
 * Fetch regional release dates and certifications for a movie from TMDB
 * Reuses in-memory certificationCache to eliminate duplicate network calls.
 * 
 * @param {number|string} movieId 
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<Array>} List of country release date entries
 */
export async function getMovieReleaseDates(movieId, signal = null) {
  if (!movieId) return [];
  const result = await fetchMovieReleaseDates(movieId, signal);
  return result?.status === 'success' && Array.isArray(result.data) ? result.data : [];
}

/**
 * Fetch movie keywords from TMDB (/movie/{id}/keywords).
 * Reuses in-memory keywordCache to eliminate duplicate network calls.
 * 
 * @param {number|string} movieId 
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<Array>} List of keyword objects
 */
export async function getMovieKeywords(movieId, signal = null) {
  if (!movieId) return [];
  const result = await fetchMovieKeywords(movieId, signal);
  return result?.status === 'success' && Array.isArray(result.data) ? result.data : [];
}

/**
 * Deeply validates a movie candidate by combining synchronous checks
 * with cached / on-demand TMDB regional certification metadata and keywords.
 * 
 * @param {Object} movie TMDB Movie Record
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<boolean>} True if compliant and allowed, false if adult/prohibited
 */
export async function verifyMovieSafetyWithReleaseDates(movie, signal = null) {
  return isMovieAllowed(movie, signal);
}
