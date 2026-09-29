/**
 * AI Mood Matcher Service
 * Communicates with the secure server-side endpoint to generate a single movie recommendation,
 * sanitizes the response, and performs the handoff to TMDB search with safety filtering.
 */

import { searchMovies, verifyMovieSafetyWithReleaseDates } from './tmdb.js';
import { filterAllowedMovies } from '../utils/safety.js';

/**
 * Sanitizes the raw LLM output into a clean, searchable movie title string.
 * @param {string} rawTitle 
 * @returns {string} Clean title
 */
export function sanitizeAiMovieTitle(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return '';
  }

  let cleaned = rawTitle.trim();

  // 1. Remove surrounding quotation marks
  cleaned = cleaned.replace(/^["'`“‘]+|["'`”’]+$/g, '');

  // 2. Remove markdown formatting (bold, italics, headers)
  cleaned = cleaned.replace(/[*_#~`]/g, '');

  // 3. Remove leading numbered prefixes (e.g. "1. Inception" -> "Inception")
  cleaned = cleaned.replace(/^\d+[\.\)]\s*/, '');

  // 4. Remove trailing punctuation like periods or commas
  cleaned = cleaned.replace(/[.,;:]+$/, '');

  // 5. Final whitespace cleanup
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Executes the full AI Mood Matcher pipeline:
 * User Mood -> Gemini API -> Single Sanitized Title -> TMDB Search -> Safety Filter -> Movie Object
 * 
 * @param {string} userMood Mood description string (e.g. "I feel sad but want an action movie")
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<{ movie: Object|null, recommendedTitle: string, totalFound: number }>}
 */
export async function getMovieByMood(userMood, signal = null) {
  const cleanMood = userMood ? userMood.trim() : '';
  if (!cleanMood) {
    throw new Error('Please enter a mood or feeling to get an AI recommendation.');
  }

  // Step 1: Request ONE movie title from the secure server-side endpoint
  let rawTitle = '';
  try {
    const response = await fetch('/api/mood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mood: cleanMood }),
      signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `AI Service Error (${response.status})`);
    }

    const data = await response.json();
    rawTitle = data.title || '';
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.error('AI mood query error:', err);
    throw new Error(
      err.message || 'Could not reach the AI Mood Matcher service. Please ensure GEMINI_API_KEY is configured.'
    );
  }

  // Step 2: Sanitize AI response
  const sanitizedTitle = sanitizeAiMovieTitle(rawTitle);
  if (!sanitizedTitle) {
    throw new Error('AI was unable to determine a suitable movie title for this mood.');
  }

  // Step 3: TMDB Handoff - Search TMDB using the sanitized title
  const tmdbResults = await searchMovies(sanitizedTitle, 1, signal);
  const rawMovies = tmdbResults.results || [];

  // Step 4: Content Safety Filter - Ensure the TMDB movie is compliant (including release certifications)
  const allowedMovies = await filterAllowedMovies(rawMovies, signal);

  if (allowedMovies.length === 0) {
    return {
      movie: null,
      recommendedTitle: sanitizedTitle,
      totalFound: 0,
    };
  }

  // Step 5: Return the first fully verified and certified allowed movie
  return {
    movie: allowedMovies[0],
    recommendedTitle: sanitizedTitle,
    totalFound: allowedMovies.length,
  };
}
