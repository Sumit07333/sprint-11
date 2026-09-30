# Cine Stream — AI Development Log

This document records the actual AI pair-programming and technical architecture sessions for the Cine Stream Media Discovery Single Page Application (SPA).

---

## Session 1 — Architecture & Project Inception

### Problem

Establish the technical architecture for Cine Stream, prioritizing progressive data hydration over bulk loading, managing API rate limits, handling missing image assets, and isolating server-side AI keys.

### Architectural Plan

1. Decouple TMDB service calls (`src/services/tmdb.js`) from React components.
2. Structure the core view hierarchy: `App` $\rightarrow$ `Home` / `Favorites` $\rightarrow$ `MovieGrid` $\rightarrow$ `MovieCard`.
3. Use native browser `IntersectionObserver` with a bottom sentinel element for infinite scrolling.
4. Implement a custom 500ms debounce helper (`src/utils/debounce.js`) with in-flight `AbortController` cancellation to eliminate search race conditions.
5. Persist user favorites with full movie schemas in `localStorage`.

### What I Learned

- Progressive data hydration prevents DOM bloat and ensures fast First Contentful Paint (FCP).
- Storing full movie objects in `localStorage` prevents re-fetching every favorited item from TMDB.
- Decoupling API services keeps the UI clean, testable, and robust against endpoint changes.

---

## Session 2 — TMDB Integration & Fallbacks

### Problem

Handle edge cases in TMDB response objects: missing posters (`null` paths), missing release dates, unrated films, and ISP connectivity issues.

### Result

- Created SVG placeholder fallback at `/placeholder-poster.svg` preserving the exact 2:3 aspect ratio.
- Sanitized TMDB date formats into 4-digit years with fallback `'N/A'`.
- Formatted vote averages with one decimal precision or `'NR'` (Not Rated).
- Implemented `getPopularMovies` and `searchMovies` in `src/services/tmdb.js`.

---

## Session 3 — 500ms Debouncing & Race Conditions

### Problem

Prevent rapid keystrokes from spamming the TMDB API and avoid race conditions where older requests overwrite newer search results.

### Result & Implementation

- Built reusable `debounce(fn, 500)` utility in `src/utils/debounce.js`.
- Coupled debounce with `AbortController` in `src/pages/Home.jsx` to abort previous in-flight requests immediately when a new search starts.

---

## Session 4 — IntersectionObserver Infinite Scrolling & Local Persistence

### Problem

Progressively hydrate movie data page-by-page as the user scrolls without re-rendering or wiping existing cards, and persist favorite movies across reloads.

### Result & Implementation

- Attached a native `IntersectionObserver` to `#infinite-scroll-sentinel` at the bottom of the grid.
- Implemented immutable appending: `setMovies(prev => [...prev, ...uniqueNew])`.
- Built `src/utils/favorites.js` with `localStorage` storage and custom window events to keep `/favorites` and the Home view synchronized.

---

## Session 5 — Content Safety Enforcement & Credential Audit

### Problem

Enforce the Cine Stream rule forbidding sexually explicit, adult/18+, or pornographic content, and remove any fallback API key constants to uphold credential safety.

### Result & Implementation

- Created centralized `isMovieAllowed(movie)` and `filterAllowedMovies(movies)` in `src/utils/safety.js`.
- Applied filtering across Popular Movies, Search, Infinite Scroll, and Favorites hydration.
- Removed fallback key from `src/services/tmdb.js` and required `VITE_TMDB_KEY` from the environment.

---

## Session 6 — Pure JavaScript Migration & AI Mood Matcher (Phase 3)

### Problem

Migrate the project strictly to JavaScript per Sprint 08 rules and implement the AI Mood Matcher querying Gemini via a secure server route with TMDB handoff.

### Result & Implementation

- Converted all `.tsx` and `.ts` files to `.jsx` and `.js`. Removed `tsconfig.json` and TypeScript devDependencies.
- Created `/api/mood` secure server-side endpoint in `vite.config.js` using `@google/genai`.
- Built `src/services/ai.js` and `src/components/MoodMatcher.jsx` to take user mood inputs, retrieve 1 title from Gemini, sanitize it, search TMDB, filter for safety, and render via `MovieCard`.

---

## Session 7 — Final Bug Fix, Error Elimination & Production Serverless Deployment

### Problem

Diagnose the 5 error logs in the preview environment, eliminate unhandled promise rejections on initial mount when `VITE_TMDB_KEY` is not yet configured, and create a production-ready serverless function for `/api/mood`.

### Result & Implementation

- Added `hasTmdbApiKey()` in `src/services/tmdb.js` and guarded `loadMovies` in `src/pages/Home.jsx` to gracefully render the setup instructions without throwing unhandled exceptions in the console.
- Created `api/mood.js` for standalone Vercel / serverless deployments.
- Verified build with `npm run build` and zero compilation errors.

---

## Session 8 — Gemini 3.6 Flash Model Migration

### Problem

The `gemini-3.8-flash` model identifier is deprecated and no longer available for new requests, causing runtime 404 / unavailable model errors when triggering the AI Mood Matcher.

### Actual Prompt

"Update the Gemini model from gemini-3.8-flash to gemini-3.6-flash across all server and serverless files. Verify zero occurrences of the outdated model and confirm build."

### Solution

- Updated the model parameter to `'gemini-3.6-flash'` in `vite.config.js` (dev server `/api/mood` route).
- Updated the model parameter to `'gemini-3.6-flash'` in `api/mood.js` (production serverless function).
- Verified zero remaining occurrences of `gemini-3.8-flash` across the codebase.
- Re-tested production compilation via `npm run build`.

### What I Learned

- Model deprecations require updating all server-side callers including dev middleware and production serverless functions.
- The `@google/genai` SDK seamlessly supports `gemini-3.6-flash` with the same `ai.models.generateContent({ model: 'gemini-3.6-flash', contents: ... })` syntax.

---

## Session 9 — Layered Adult & Content Safety Hardening

### Problem

Audit and strengthen the centralized content safety filtering across all application layers (Popular feed, Search, Infinite Scroll, Favorites hydration, and AI Mood Matcher) to ensure explicit, pornographic, or 18+/adult content is strictly prevented from entering React state, localStorage, or DOM without breaking normal genre titles or Sprint 08 features.

### Actual Prompt

"Audit and strengthen the existing movie-content safety filtering so that Cine Stream does not intentionally display, recommend, save, or surface vulgar, sexually explicit, pornographic, or clearly 18+/adult-only movies while preserving all Sprint 08 requirements."

### Changes Made

- Expanded `src/utils/safety.js` with comprehensive type-handling for TMDB `adult` flag (`true`, `'true'`, `1`, `'1'`).
- Added word-boundary explicit regex patterns specifically targeting hardcore/pornographic/sexually explicit labels while preserving normal action, crime, and romance terms.
- Added genre array inspection for adult/erotic genre tags.
- Strengthened `src/utils/favorites.js` to actively purge any corrupt/unsafe legacy entries from `localStorage` during `getFavorites()` hydration.
- Re-verified filtering at all 5 checkpoints: `Home.jsx` initial fetch, `Home.jsx` search, `Home.jsx` infinite scroll page N+1, `Favorites.jsx` rendering, and `ai.js` AI recommendation handoff.

### Testing

- Tested `isMovieAllowed({ adult: true })` $\rightarrow$ correctly returns `false`.
- Tested `isMovieAllowed({ adult: 'true' })` $\rightarrow$ correctly returns `false`.
- Tested `isMovieAllowed({ adult: false, title: 'The Dark Knight' })` $\rightarrow$ correctly returns `true`.
- Verified production build with `npm run build` passing with zero errors.

### What I Learned

- Layered safety filters must inspect metadata types flexibly (numbers, strings, booleans).
- Filtering must always occur before setting React state (`setMovies`) rather than hiding elements via CSS to prevent unsafe elements from ever entering the DOM.

---

## Session 10 — TMDB Regional Certification Integration & In-Memory Safety Cache

### Problem

TMDB's boolean `adult` flag alone does not always reflect regional age-rating restrictions (such as India's CBFC 'A' adult-only 18+ rating or international NC-17/R18 ratings). Certification data needed to be fetched and evaluated without making repetitive API requests that could bottleneck Infinite Scroll performance.

### Actual Prompt

"Strengthen the existing adult-content filter with reliable TMDB certification information where available, while keeping the application performant and preserving every Sprint 08 requirement."

### Changes Made

- Added `isCertificationAllowed()` in `src/utils/safety.js` prioritizing India (`IN`) CBFC certifications ('A' / '18+' / 'ADULT' rejected; 'U', 'UA', 'U/A' allowed) with reliable international fallbacks (US 'NC-17', 'X', 'XXX'; UK 'R18', '18'; AU 'X 18+', 'RC'; DE '18').
- Created an in-memory `certificationCache` Map to prevent duplicate `/movie/{id}/release_dates` network requests.
- Integrated `getMovieReleaseDates()` and `verifyMovieSafetyWithReleaseDates()` in `src/services/tmdb.js`.
- Integrated certification verification into `src/services/ai.js` to ensure AI recommendations validate release certifications before rendering.
- Preserved original TMDB `adult` metadata in `src/utils/favorites.js` without altering source data.

### Testing

- Tested `isMovieAllowed({ adult: true })` $\rightarrow$ returns `false`.
- Tested `isCertificationAllowed([{ iso_3166_1: 'IN', release_dates: [{ certification: 'A' }] }])` $\rightarrow$ returns `false`.
- Tested `isCertificationAllowed([{ iso_3166_1: 'IN', release_dates: [{ certification: 'UA' }] }])` $\rightarrow$ returns `true`.
- Tested `isCertificationAllowed([{ iso_3166_1: 'US', release_dates: [{ certification: 'NC-17' }] }])` $\rightarrow$ returns `false`.
- Tested `isCertificationAllowed([{ iso_3166_1: 'US', release_dates: [{ certification: 'PG-13' }] }])` $\rightarrow$ returns `true`.
- Tested `isMovieAllowed({ id: 999, title: 'Inception', adult: false })` $\rightarrow$ returns `true`.
- Verified production build via `npm run build` succeeds cleanly.

### What I Learned

- In-memory caching (`certificationCache.get(movieId)`) avoids request loops and keeps high-frequency UI interactions like Infinite Scroll fast and responsive.
- Region-specific certification rules require parsing country-keyed release date structures rather than expecting a top-level string.---

## Session 11 — Strict Family-Safe Movie Filter Architecture & Concurrency Control

### Problem

Ensure strict asynchronous TMDB Indian (CBFC) release-date certification validation across all movie pipelines (Popular, 500ms Debounced Search, IntersectionObserver Infinite Scroll, LocalStorage Favorites, and Gemini 3.6 Flash Mood Matcher) before any movie enters React state or localStorage, with worker concurrency limits and deduplicated in-memory caching to eliminate redundant network requests.

### Actual Prompt

"Cine Stream must NOT intentionally show, recommend, or save vulgar, sexually explicit, pornographic, or clearly 18+/adult-only movies. Implement a centralized asynchronous safety system that can obtain TMDB certification information when necessary using GET /movie/{movie_id}/release_dates, prioritizing country code IN, with request concurrency control and caching."

### Changes Made

- Centralized asynchronous `isMovieAllowed(movie, signal)` and concurrency-controlled `filterAllowedMovies(movies, signal)` in `src/utils/safety.js`.
- Implemented `fetchMovieReleaseDates(movieId, signal)` with `certificationCache` and in-flight request deduplication (`inFlightRequests`).
- Configured Indian CBFC certification validation (`isCertificationAllowed`): rejects `'A'`, `'ADULT'`, `'18+'`, `'A/18+'`, `'A/V'`, `'A/'`, and foreign 18+ classifications (`'NC-17'`, `'X'`, `'XXX'`, `'R18'`, `'18'`, `'X 18+'`, `'FSK 18'`), while safely permitting general and parental-guidance films (`'U'`, `'UA'`, `'U/A'`, `'PG-13'`, etc.).
- Refactored `Home.jsx` (`loadMovies`) to `await filterAllowedMovies(data.results)` before setting React state or appending to Infinite Scroll.
- Updated `src/utils/favorites.js` with asynchronous `toggleFavorite` safety checks and startup `auditAndCleanFavorites()` purging.
- Updated `src/services/ai.js` to run the AI recommendation through `await filterAllowedMovies(rawMovies)`.
- Updated `api/mood.js` to use the explicit prompt forbidding pornography, sexually explicit movies, nudity-focused movies, or adult-only movies with `gemini-3.6-flash`.

### Testing

- Tested `adult === true`, `"true"`, `1`, `"1"` $\rightarrow$ all immediately rejected.
- Tested TMDB Indian CBFC 'A' and international NC-17/18/R18 certifications $\rightarrow$ rejected.
- Tested normal mainstream action/romance/comedy titles (`'UA'`, `'U'`, `'PG-13'`, unrated safe) $\rightarrow$ allowed.
- Verified Popular, Search, Infinite Scroll Page N+1, Favorites, and AI Mood Matcher pipelines reject unsafe movies before React state.
- Verified build succeeds cleanly with zero errors via `npm run build`.

### What I Learned

- Asynchronous safety filtering must be awaited prior to state commits (`setMovies`) rather than using synchronous approximations or CSS visual masking.
- Concurrency worker pools prevent browser socket saturation when validating multi-item paginated lists.

---

## Session 12 — TMDB Keyword-Based Safety Validation & Dual-Layer Caching

### Problem

Prevent movies containing nudity, pornography, sexually explicit content, or clearly adult/18+ content from passing through when the `adult` boolean or certification alone is insufficient, by integrating TMDB's official movie keywords endpoint (`/movie/{movie_id}/keywords`) into the centralized safety pipeline, with in-memory caching, in-flight request deduplication, and concurrency control.

### Actual Prompt

"The current regex-based title/overview check is too weak. Use TMDB's official movie keywords endpoint where appropriate: GET /movie/{movie_id}/keywords. Use the keywords returned by TMDB as an additional safety signal. Normalize them, identify clearly sexual/adult/nudity-related keywords, cache keyword requests, and integrate with the existing adult flag and certification system."

### Changes Made

- Added `fetchMovieKeywords(movieId, signal)` and `keywordCache` Map with `inFlightKeywordRequests` deduplication in `src/utils/safety.js`.
- Implemented `isKeywordsAllowed(keywords)` with targeted detection of unsafe classifications (pornography, explicit sex, sexual intercourse, explicit nudity, full frontal nudity, female nudity, male nudity, adult entertainment, sexploitation, erotic pornography, unsimulated sex, xxx, softcore porn, sex scene, erotica, sex tape, porn star) while preserving standard romance/action keywords (love, romance, kiss, relationship, marriage, dating, couple, action, murder, thriller).
- Integrated keyword evaluation into `isMovieAllowedSync(movie)` (testing `movie.keywords` directly) and `isMovieAllowed(movie, signal)` (parallel fetching of release dates and keywords with cached lookup).
- Added `getMovieKeywords(movieId, signal)` and exported caching helpers in `src/services/tmdb.js`.
- Verified all ingestion points (Popular, Search, Infinite Scroll, Favorites, AI Mood Matcher) route through `filterAllowedMovies` and `isMovieAllowed`.
- Updated `README.md` to reflect the multi-layered metadata, certification, and keyword safety checks.

### Testing

- **Test A**: `{ adult: true }` $\rightarrow$ REJECTED.
- **Test B**: `{ adult: false, keywords: ["pornography"] }` $\rightarrow$ REJECTED.
- **Test C**: `{ adult: false, keywords: ["explicit sexual content"] }` $\rightarrow$ REJECTED.
- **Test D**: Indian CBFC 'A' certification $\rightarrow$ REJECTED.
- **Test E**: Foreign adult-only classifications (NC-17, R18, X 18+, 18) $\rightarrow$ REJECTED.
- **Test F**: Normal action movie (`{ adult: false, keywords: ["superhero", "action", "chase"] }`) $\rightarrow$ ALLOWED.
- **Test G**: Normal romance movie (`{ adult: false, keywords: ["love", "romance", "relationship"] }`) $\rightarrow$ ALLOWED.
- **Test H**: AI Mood Matcher recommendation for adult/nudity title $\rightarrow$ REJECTED before rendering MovieCard.
- **Test I**: Unsafe movie in localStorage $\rightarrow$ Cleaned on startup via `auditAndCleanFavorites()`.
- Verified `npm run build` succeeds cleanly.

### What I Learned

- Querying TMDB keywords alongside release-date certifications creates an effective, metadata-driven safety net without making speculative assumptions or requiring LLM scene analysis.
- Dual-layer caching (`certificationCache` + `keywordCache`) and in-flight promise sharing prevent socket exhaustion and maintain snappy UI response during fast infinite scrolling.

---

## Session 13 — Strict Safe Movie Mode & Fail-Safe Verification Architecture

### Problem

Previously, when safety metadata network calls (`/release_dates` or `/keywords`) encountered network errors, rate limits, or missing API keys, they could silently return `[]` and allow the candidate movie through as if safe. Additionally, if Indian certifications were unrated, some regional 18+ classifications were not globally evaluated. A strict safe-mode architecture was needed where `FAILED VERIFICATION !== SAFE` (only verified and allowed movies reach the state), with universal regional adult classification rejection and structured status caching.

### Actual Prompt

"CINE STREAM — FIX THE REAL ADULT/18+ FILTER BUG. The current code treats failed/missing safety metadata as safe (fetchMovieReleaseDates() returns [] on error). Implement strict safe mode: IF reliable TMDB data says the movie is adult/explicit -> REJECT. IF reliable safety metadata cannot be obtained -> DO NOT DISPLAY THE MOVIE. Also reject if ANY reliable regional certification (IN, US, UK, AU, DE) clearly identifies the movie as adult-only/18+. Cache explicit failure status separately from empty results."

### Changes Made

- Refactored `fetchMovieReleaseDates` and `fetchMovieKeywords` in `src/utils/safety.js` to return explicit result objects `{ status: 'success', data: Array }` or `{ status: 'error', reason: string }`.
- Implemented strict safety validation in `isMovieAllowed(movie, signal)`: if `certResult.status !== 'success'` or `keywordResult.status !== 'success'`, the movie is rejected (`return false`) rather than silently passed.
- Expanded `isCertificationAllowed(results)`: scans all regional release date records. If ANY reliable regional entry indicates adult classification (IN: `A`, `ADULT`, `18+`; US: `NC-17`, `X`, `XXX`, `ADULT`; GB: `18`, `R18`, `X`; AU: `R18+`, `X18+`, `RC`; DE: `18`, `FSK 18`; Global: `NC-17`, `R18`, `X`, `XXX`, `ADULT`, `RC`), the movie is immediately rejected.
- Updated `certificationCache` and `keywordCache` to store structured verification records `{ status, data, reason }`, preventing API failures from being cached as empty "safe" lists.
- Added `evaluateMovieSafety(movie, signal)` helper providing detailed diagnostic metadata `{ allowed, verified, reason }`.
- Synchronized `src/services/tmdb.js` delegation for `getMovieReleaseDates` and `getMovieKeywords` to use the unified cache and structured safety pipelines.

### Testing

- **Test 1: Adult TMDB flag (`adult: true`, `'true'`, `1`)**: Rejected immediately by Layer 1 sync checks.
- **Test 2: Indian CBFC 'A' / 'ADULT' Certification**: Evaluated and rejected across country entries.
- **Test 3: US NC-17 / X / XXX / ADULT Certification**: Evaluated and rejected.
- **Test 4: UK 18 / R18 / X Certification**: Evaluated and rejected.
- **Test 5: Australia R18+ / X 18+ / RC Certification**: Evaluated and rejected.
- **Test 6: Germany 18 / FSK 18 Certification**: Evaluated and rejected.
- **Test 7: TMDB Adult/Nudity/Hardcore/Pornographic Keywords**: Normalized and rejected by `isKeywordsAllowed`.
- **Test 8: Mainstream Action / Thriller Movie**: Clean certifications and keywords -> Allowed and displayed.
- **Test 9: Mainstream Romance Movie (with keywords like "love", "romance", "relationship")**: Allowed and displayed.
- **Test 10: Certification or Keyword API Network Failure (Status: 'error')**: Rejected by strict safe mode (does not leak to UI).
- **Test 11: AI Mood Matcher Recommendation for Unsafe Movie**: Filtered and rejected before rendering MovieCard.
- **Test 12: Unsafe/Unverified Favorite**: Blocked in `toggleFavorite()` and purged during `auditAndCleanFavorites()`.
- Verified `npm run build` succeeds cleanly.

### What I Learned

- Fail-safe security architecture in content delivery requires explicit discriminators (`status: 'success' | 'error'`) rather than using falsy/empty values to represent both empty data and network failure.
- Universal regional certification cross-checking ensures titles that bypassed one local classification authority are caught by others without false positives on standard mature/romance genres.
