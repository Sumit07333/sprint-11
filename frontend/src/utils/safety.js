/**
 * Cine Stream Content Safety Filter — STRICT SAFE MOVIE MODE
 * Enforces strict filtering against 18+ adult-only, pornographic, sexually explicit,
 * nudity-focused, or adult sexual content across all application pipelines.
 * 
 * Safety Rule:
 * - IF reliable TMDB data indicates adult/explicit content -> REJECT.
 * - IF reliable safety metadata cannot be obtained (API failure/error) -> REJECT (DO NOT DISPLAY).
 * - ONLY movies with VERIFIED === true and ALLOWED === true may reach React state.
 * 
 * Multi-layer Defense Architecture:
 * Layer 1: TMDB Adult Flag (adult === true, 'true', 1, '1') & synchronous metadata
 * Layer 2: TMDB Release Date & Comprehensive Regional Certifications (/movie/{id}/release_dates)
 * Layer 3: TMDB Keywords (/movie/{id}/keywords) & Keyword Metadata
 * Layer 4: Explicit / Adult Text & Genre Metadata Verification
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Targeted terms specifically addressing sexually explicit, hardcore, or pornographic text
const EXPLICIT_PATTERNS = [
  /\bporn(o|ography|ographic|star)?\b/i,
  /\b(nude|nudity|naked|topless|stripper|striptease)\b/i,
  /\b(erotic|erotica|sensual|seduction)\b/i,
  /\b(xxx|hardcore|softcore)\b/i,
  /\b(hentai|ecchi|sex|sexual|sexually|intercourse)\b/i,
  /\b(sex\s*tape|sex\s*film|sex\s*scene|sexploitation)\b/i,
  /\b(adults?\s*only|adult\s*film|adult\s*movie)\b/i,
];

// Helper to test if a search query itself is unsafe
export function isQueryUnsafe(query) {
  if (!query || typeof query !== 'string') return false;
  const normalized = query.trim().toLowerCase();
  return EXPLICIT_PATTERNS.some((pattern) => pattern.test(normalized));
}

// Targeted regex patterns specifically identifying unsafe sexual/nudity/pornographic keywords
const UNSAFE_KEYWORD_PATTERNS = [
  /\bpornograph(y|ic)\b/i,
  /\bhardcore\s+(sex|porn|pornography|adult)\b/i,
  /\bexplicit\s+(sex|sexual|sexual\s+content|nudity)\b/i,
  /\bsexual\s+(intercourse|activity|exploitation|content)\b/i,
  /\b(full\s+frontal|frontal|graphic|unsimulated|female|male)\s+nudity\b/i,
  /\bunsimulated\s+sex\b/i,
  /\bsexploitation\b/i,
  /\berotic\s+pornography\b/i,
  /\badult\s+(entertainment|movie|film|industry|video)\b/i,
  /\bxxx(\b|\s)/i,
  /\bsoftcore\s+(porn|pornography|sex)\b/i,
  /\bporn\s*star\b/i,
  /\bcybersex\b/i,
  /\bsex\s+tape\b/i,
  /\bsex\s+film\b/i,
  /\bsex\s+scene\b/i,
  /\berotica\b/i,
  /\bnudity-focused\b/i,
];

// Exact normalized keyword names that represent clearly adult/sexually explicit/nudity classifications
const UNSAFE_EXACT_KEYWORDS = new Set([
  'pornography',
  'pornographic',
  'porn',
  'hardcore porn',
  'hardcore pornography',
  'hardcore sex',
  'hardcore',
  'explicit sex',
  'explicit sexual content',
  'sexual intercourse',
  'sexual activity',
  'explicit nudity',
  'full frontal nudity',
  'frontal nudity',
  'female nudity',
  'male nudity',
  'nudity',
  'unsimulated sex',
  'adult entertainment',
  'sexploitation',
  'erotic pornography',
  'sexual exploitation',
  'nudity-focused content',
  'xxx',
  'adult film',
  'adult movie',
  'erotica',
  'softcore',
  'softcore porn',
  'softcore pornography',
  'sex film',
  'sex scene',
  'erotic photography',
  'porn star',
  'pornstar',
  'sex tape',
]);

// Adult-only certifications by country code (normalized uppercase)
const ADULT_CERTIFICATIONS_BY_COUNTRY = {
  IN: ['A', 'ADULT', '18+', 'A/18+', 'A/V', 'A/', 'A '],
  US: ['NC-17', 'X', 'XXX', 'ADULT'],
  GB: ['18', 'R18', 'X'],
  AU: ['R18+', 'R 18+', 'X18+', 'X 18+', 'RC'],
  DE: ['18', 'FSK 18', 'FSK18'],
};

// Global fallback adult-only certification identifiers
const GLOBAL_ADULT_CERT_KEYWORDS = ['NC-17', 'R18', 'R18+', 'X', 'XXX', 'ADULT', 'X 18+', 'X18+', 'FSK 18', 'FSK18', 'RC'];

// In-memory caches to avoid repetitive network requests (keyed by TMDB movie ID)
// Cache structure: Map<number, { status: 'success'|'error', data?: Array, reason?: string }>
const certificationCache = new Map();
const inFlightCertificationRequests = new Map();

const keywordCache = new Map();
const inFlightKeywordRequests = new Map();

/**
 * Retrieve TMDB API key safely from Vite environment
 * @returns {string|null}
 */
function getTmdbApiKeySafe() {
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_TMDB_KEY : undefined;
  if (envKey && envKey.trim() !== '' && envKey !== 'your_tmdb_api_key_here') {
    return envKey.trim();
  }
  return null;
}

/**
 * Set cached certification data for a movie
 * @param {number|string} movieId 
 * @param {Array|Object} releaseDatesResults 
 */
export function setMovieCertificationCache(movieId, releaseDatesResults) {
  if (movieId) {
    if (releaseDatesResults && releaseDatesResults.status) {
      certificationCache.set(Number(movieId), releaseDatesResults);
    } else {
      certificationCache.set(Number(movieId), {
        status: 'success',
        data: Array.isArray(releaseDatesResults) ? releaseDatesResults : [],
      });
    }
  }
}

/**
 * Get cached certification data for a movie
 * @param {number|string} movieId 
 * @returns {Object|undefined} Cached record or undefined
 */
export function getMovieCertificationCache(movieId) {
  if (!movieId) return undefined;
  return certificationCache.get(Number(movieId));
}

/**
 * Set cached keywords for a movie
 * @param {number|string} movieId 
 * @param {Array|Object} keywords 
 */
export function setMovieKeywordCache(movieId, keywords) {
  if (movieId) {
    if (keywords && keywords.status) {
      keywordCache.set(Number(movieId), keywords);
    } else {
      keywordCache.set(Number(movieId), {
        status: 'success',
        data: Array.isArray(keywords) ? keywords : [],
      });
    }
  }
}

/**
 * Get cached keywords for a movie
 * @param {number|string} movieId 
 * @returns {Object|undefined} Cached record or undefined
 */
export function getMovieKeywordCache(movieId) {
  if (!movieId) return undefined;
  return keywordCache.get(Number(movieId));
}

/**
 * Fetch regional release dates and certifications for a movie from TMDB.
 * Returns an explicit status object:
 *   { status: 'success', data: Array } | { status: 'error', reason: string }
 * 
 * Reuses in-memory cache and dedupes in-flight requests.
 * 
 * @param {number|string} movieId 
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<{ status: 'success'|'error', data?: Array, reason?: string }>}
 */
export async function fetchMovieReleaseDates(movieId, signal = null) {
  if (!movieId) {
    return { status: 'error', reason: 'Missing movieId' };
  }
  const numId = Number(movieId);

  if (certificationCache.has(numId)) {
    return certificationCache.get(numId);
  }

  if (inFlightCertificationRequests.has(numId)) {
    return inFlightCertificationRequests.get(numId);
  }

  const apiKey = getTmdbApiKeySafe();
  if (!apiKey) {
    const errRes = { status: 'error', reason: 'Missing TMDB API key' };
    return errRes;
  }

  const url = `${TMDB_BASE_URL}/movie/${numId}/release_dates?api_key=${apiKey}`;

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        const errorRecord = {
          status: 'error',
          reason: `HTTP ${response.status}: Failed to fetch release dates`,
        };
        certificationCache.set(numId, errorRecord);
        return errorRecord;
      }
      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : [];
      const successRecord = { status: 'success', data: results };
      certificationCache.set(numId, successRecord);
      return successRecord;
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      const errorRecord = {
        status: 'error',
        reason: error.message || 'Network error fetching release dates',
      };
      // Do not permanently cache network dropouts if they could be transient,
      // but return error state so this evaluation rejects the movie safely
      return errorRecord;
    } finally {
      inFlightCertificationRequests.delete(numId);
    }
  })();

  inFlightCertificationRequests.set(numId, fetchPromise);
  return fetchPromise;
}

/**
 * Fetch TMDB keywords for a movie.
 * Returns an explicit status object:
 *   { status: 'success', data: Array } | { status: 'error', reason: string }
 * 
 * Reuses in-memory cache and dedupes in-flight requests.
 * 
 * @param {number|string} movieId 
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<{ status: 'success'|'error', data?: Array, reason?: string }>}
 */
export async function fetchMovieKeywords(movieId, signal = null) {
  if (!movieId) {
    return { status: 'error', reason: 'Missing movieId' };
  }
  const numId = Number(movieId);

  if (keywordCache.has(numId)) {
    return keywordCache.get(numId);
  }

  if (inFlightKeywordRequests.has(numId)) {
    return inFlightKeywordRequests.get(numId);
  }

  const apiKey = getTmdbApiKeySafe();
  if (!apiKey) {
    const errRes = { status: 'error', reason: 'Missing TMDB API key' };
    return errRes;
  }

  const url = `${TMDB_BASE_URL}/movie/${numId}/keywords?api_key=${apiKey}`;

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        const errorRecord = {
          status: 'error',
          reason: `HTTP ${response.status}: Failed to fetch keywords`,
        };
        keywordCache.set(numId, errorRecord);
        return errorRecord;
      }
      const data = await response.json();
      const keywords = Array.isArray(data.keywords) ? data.keywords : [];
      const successRecord = { status: 'success', data: keywords };
      keywordCache.set(numId, successRecord);
      return successRecord;
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      const errorRecord = {
        status: 'error',
        reason: error.message || 'Network error fetching keywords',
      };
      return errorRecord;
    } finally {
      inFlightKeywordRequests.delete(numId);
    }
  })();

  inFlightKeywordRequests.set(numId, fetchPromise);
  return fetchPromise;
}

/**
 * Validates TMDB keywords to check for adult, sexually explicit, pornographic, or nudity-focused classifications.
 * Allows normal romantic, dramatic, thriller, and action tags (like love, romance, kiss, relationship).
 * 
 * @param {Array|Object} keywords Keywords array (strings or objects with .name) or object with .keywords
 * @returns {boolean} True if allowed/safe, False if contains explicit/adult keywords
 */
export function isKeywordsAllowed(keywords) {
  if (!keywords) return true;

  let list = [];
  if (Array.isArray(keywords)) {
    list = keywords;
  } else if (Array.isArray(keywords.keywords)) {
    list = keywords.keywords;
  } else if (typeof keywords === 'string') {
    list = [keywords];
  } else {
    return true;
  }

  for (const item of list) {
    let name = '';
    if (typeof item === 'string') {
      name = item;
    } else if (item && typeof item === 'object' && item.name) {
      name = String(item.name);
    }

    const normalized = name.trim().toLowerCase();
    if (!normalized) continue;

    // Check exact matches against prohibited classifications
    if (UNSAFE_EXACT_KEYWORDS.has(normalized)) {
      return false;
    }

    // Check targeted regex patterns
    for (const pattern of UNSAFE_KEYWORD_PATTERNS) {
      if (pattern.test(normalized)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates regional certification release dates array from TMDB.
 * In STRICT SAFE MODE:
 * If ANY reliable regional certification clearly identifies the movie as adult-only (18+),
 * the movie is REJECTED. Another country's safer certification cannot override a clearly adult classification.
 * 
 * @param {Array} results Array of country release date objects from TMDB /movie/{id}/release_dates
 * @returns {boolean} True if allowed/safe, False if classified as adult/18+
 */
export function isCertificationAllowed(results) {
  if (!Array.isArray(results) || results.length === 0) {
    // If TMDB returned a 200 OK with no release dates array, allow other layers to decide
    return true;
  }

  // Iterate across all country release date records
  for (const entry of results) {
    if (!entry || !Array.isArray(entry.release_dates)) continue;
    const countryCode = String(entry.iso_3166_1 || '').trim().toUpperCase();

    for (const rd of entry.release_dates) {
      const cert = String(rd?.certification || '').trim().toUpperCase();
      if (!cert) continue;

      // 1. Check specific configured country lists
      if (countryCode === 'IN') {
        // India CBFC classifications:
        // 'A' -> Adults Only (18+) -> REJECT
        // 'U', 'UA', 'U/A', 'UA 7+', 'UA 13+', 'UA 16+', 'V/U', 'V/UA', 'S' -> Allowed
        if (
          cert === 'A' ||
          cert === 'ADULT' ||
          cert === '18+' ||
          cert === 'A/18+' ||
          cert === 'A/V' ||
          cert.startsWith('A/') ||
          cert.startsWith('A ')
        ) {
          return false;
        }
      } else if (ADULT_CERTIFICATIONS_BY_COUNTRY[countryCode]) {
        if (ADULT_CERTIFICATIONS_BY_COUNTRY[countryCode].includes(cert)) {
          return false;
        }
      }

      // 2. Universal adult certification check across any region
      if (GLOBAL_ADULT_CERT_KEYWORDS.includes(cert)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Fast synchronous safety check for obvious adult flags, missing identifiers, adult genres, explicit regex,
 * and already-cached certification/keyword verdicts.
 * 
 * @param {Object} movie TMDB Movie Record
 * @returns {boolean} True if provisionally compliant, false if prohibited
 */
export function isMovieAllowedSync(movie) {
  if (!movie || typeof movie !== 'object') {
    return false;
  }

  // 1. Strict TMDB adult flag check (handles boolean, string, or truthy number representations)
  if (
    movie.adult === true ||
    movie.adult === 'true' ||
    movie.adult === 1 ||
    movie.adult === '1'
  ) {
    return false;
  }

  // 2. Reject missing core identifiers
  if (!movie.id || !movie.title || typeof movie.title !== 'string') {
    return false;
  }

  // 3. Inspect cached certification data if available
  const cachedCertRecord = getMovieCertificationCache(movie.id);
  if (cachedCertRecord) {
    if (cachedCertRecord.status === 'error') {
      return false; // Failed verification
    }
    if (cachedCertRecord.status === 'success' && !isCertificationAllowed(cachedCertRecord.data)) {
      return false; // Adult certification detected
    }
  }

  // 4. Inspect cached keyword data if available
  const cachedKeywordRecord = getMovieKeywordCache(movie.id);
  if (cachedKeywordRecord) {
    if (cachedKeywordRecord.status === 'error') {
      return false; // Failed verification
    }
    if (cachedKeywordRecord.status === 'success' && !isKeywordsAllowed(cachedKeywordRecord.data)) {
      return false; // Explicit keywords detected
    }
  }

  // 5. Direct certification property on movie object (if enriched or stored)
  if (movie.certification) {
    const directCert = String(movie.certification).trim().toUpperCase();
    if (['A', 'NC-17', 'X', 'XXX', 'R18', '18+', 'ADULT', 'X 18+', 'FSK 18', 'FSK18', 'RC'].includes(directCert)) {
      return false;
    }
  }

  // 6. Direct keywords property on movie object (e.g. from tests, details payload, or cache)
  if (movie.keywords && !isKeywordsAllowed(movie.keywords)) {
    return false;
  }

  // 7. Inspect genre tags or genre names if available
  if (Array.isArray(movie.genres)) {
    const hasAdultGenre = movie.genres.some((g) => {
      const gName = String(g?.name || '').toLowerCase();
      return gName.includes('erotic') || gName.includes('adult');
    });
    if (hasAdultGenre) return false;
  }

  // 8. Targeted explicit pattern checks on title, original title, and overview
  const titleText = `${movie.title || ''} ${movie.original_title || ''}`;
  const overviewText = String(movie.overview || '');

  for (const pattern of EXPLICIT_PATTERNS) {
    if (pattern.test(titleText) || pattern.test(overviewText)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates whether a movie object complies with Cine Stream STRICT SAFE MODE.
 * 
 * Returns a Promise<boolean>:
 * - true: Movie is VERIFIED and ALLOWED.
 * - false: Movie is UNSAFE or VERIFICATION FAILED.
 * 
 * @param {Object} movie TMDB Movie Record
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<boolean>} True if compliant and verified, false if prohibited or unverified
 */
export async function isMovieAllowed(movie, signal = null) {
  // Step 1: Run fast synchronous checks (adult flag, missing id/title, genres, explicit text, cached data)
  if (!isMovieAllowedSync(movie)) {
    return false;
  }

  // Step 2: Fetch release dates and keywords in parallel with caching and deduplication
  try {
    const [certResult, keywordResult] = await Promise.all([
      fetchMovieReleaseDates(movie.id, signal),
      fetchMovieKeywords(movie.id, signal),
    ]);

    // STRICT SAFE MODE: Verification failure (network error, API key error, etc.) must NEVER silently pass
    if (certResult.status !== 'success') {
      return false;
    }

    if (keywordResult.status !== 'success') {
      return false;
    }

    // Step 3: Validate certification results
    if (certResult.data && certResult.data.length > 0) {
      const allowedByCert = isCertificationAllowed(certResult.data);
      if (!allowedByCert) {
        return false;
      }
    }

    // Step 4: Validate keyword results
    if (keywordResult.data && keywordResult.data.length > 0) {
      const allowedByKeywords = isKeywordsAllowed(keywordResult.data);
      if (!allowedByKeywords) {
        return false;
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    return false;
  }

  return true;
}

/**
 * Detailed safety validator returning a structured outcome:
 * { allowed: boolean, verified: boolean, reason?: string }
 * 
 * @param {Object} movie 
 * @param {AbortSignal} [signal] 
 * @returns {Promise<{ allowed: boolean, verified: boolean, reason?: string }>}
 */
export async function evaluateMovieSafety(movie, signal = null) {
  if (!isMovieAllowedSync(movie)) {
    return { allowed: false, verified: true, reason: 'failed_sync_check' };
  }

  try {
    const [certResult, keywordResult] = await Promise.all([
      fetchMovieReleaseDates(movie.id, signal),
      fetchMovieKeywords(movie.id, signal),
    ]);

    if (certResult.status !== 'success') {
      return { allowed: false, verified: false, reason: 'certification_fetch_failed' };
    }

    if (keywordResult.status !== 'success') {
      return { allowed: false, verified: false, reason: 'keywords_fetch_failed' };
    }

    if (certResult.data && !isCertificationAllowed(certResult.data)) {
      return { allowed: false, verified: true, reason: 'adult_certification' };
    }

    if (keywordResult.data && !isKeywordsAllowed(keywordResult.data)) {
      return { allowed: false, verified: true, reason: 'adult_keywords' };
    }

    return { allowed: true, verified: true };
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    return { allowed: false, verified: false, reason: err.message };
  }
}

/**
 * Filters an array of movies through the full asynchronous safety pipeline with concurrency control.
 * In STRICT SAFE MODE, only movies with `isMovieAllowed === true` (verified + allowed) are returned.
 * 
 * @param {Array} movies List of movie records from TMDB
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<Array>} List of validated and permitted movies
 */
export async function filterAllowedMovies(movies, signal = null) {
  if (!Array.isArray(movies) || movies.length === 0) {
    return [];
  }

  // Step 1: Initial fast filter using synchronous criteria (drops adult:true, keywords, cached 18+, etc.)
  const candidateMovies = movies.filter(isMovieAllowedSync);
  if (candidateMovies.length === 0) {
    return [];
  }

  // Step 2: Concurrency-controlled async certification and keyword evaluation
  const CONCURRENCY_LIMIT = 5;
  const evaluationResults = new Array(candidateMovies.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < candidateMovies.length) {
      const idx = currentIndex++;
      try {
        const isAllowed = await isMovieAllowed(candidateMovies[idx], signal);
        evaluationResults[idx] = isAllowed;
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        evaluationResults[idx] = false;
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY_LIMIT, candidateMovies.length) },
    () => worker()
  );

  await Promise.all(workers);

  return candidateMovies.filter((_, idx) => evaluationResults[idx] === true);
}

/**
 * Synchronous fallback filter for already cached/hydrated data
 * @param {Array} movies 
 * @returns {Array}
 */
export function filterAllowedMoviesSync(movies) {
  if (!Array.isArray(movies)) return [];
  return movies.filter(isMovieAllowedSync);
}
