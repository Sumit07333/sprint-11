import { isMovieAllowed, isMovieAllowedSync, filterAllowedMovies } from './safety.js';

const STORAGE_KEY = 'cine_stream_favorites';

/**
 * Get all stored favorite movies from localStorage with synchronous safety filter
 * @returns {Array} Array of movie objects
 */
export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Strict safety audit on hydrated data
    const safeList = parsed.filter(isMovieAllowedSync);

    // If unsafe or corrupt entries were detected in stored data, purge them from storage
    if (safeList.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeList));
    }

    return safeList;
  } catch (err) {
    console.error('Failed to parse favorites from localStorage:', err);
    return [];
  }
}

/**
 * Asynchronously audits all stored favorites against TMDB certification data and purges any unsafe entries
 * @returns {Promise<Array>} Cleaned safe favorites list
 */
export async function auditAndCleanFavorites() {
  try {
    const current = getFavorites();
    if (current.length === 0) return [];
    const fullySafe = await filterAllowedMovies(current);
    if (fullySafe.length !== current.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullySafe));
      window.dispatchEvent(new Event('cine_stream_favorites_updated'));
    }
    return fullySafe;
  } catch (err) {
    console.error('Failed to audit favorites:', err);
    return getFavorites();
  }
}

/**
 * Check if a movie is currently favorited
 * @param {number|string} movieId 
 * @returns {boolean}
 */
export function isFavorite(movieId) {
  if (!movieId) return false;
  const favorites = getFavorites();
  return favorites.some(movie => String(movie.id) === String(movieId));
}

/**
 * Toggle a movie in favorites with asynchronous safety check
 * @param {Object} movie 
 * @returns {Promise<Array>} Updated favorites array
 */
export async function toggleFavorite(movie) {
  if (!movie || !movie.id) return getFavorites();

  const isAllowed = await isMovieAllowed(movie);
  if (!isAllowed) {
    console.warn(`Movie ${movie.title} (#${movie.id}) was rejected by the safety filter and cannot be favorited.`);
    return getFavorites();
  }

  const current = getFavorites();
  const exists = current.some(item => String(item.id) === String(movie.id));

  let updated;
  if (exists) {
    updated = current.filter(item => String(item.id) !== String(movie.id));
  } else {
    // Sanitize and persist required properties for full card rendering
    const sanitized = {
      id: movie.id,
      title: movie.title || 'Untitled',
      poster_path: movie.poster_path || null,
      release_date: movie.release_date || '',
      vote_average: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
      overview: movie.overview || '',
      adult: Boolean(movie.adult),
    };
    updated = [sanitized, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for cross-component live sync
    window.dispatchEvent(new Event('cine_stream_favorites_updated'));
  } catch (err) {
    console.error('Failed to persist favorites to localStorage:', err);
  }

  return updated;
}
