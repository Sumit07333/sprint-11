import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import MovieGrid from '../components/MovieGrid.jsx';
import MoodMatcher from '../components/MoodMatcher.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getPopularMovies, searchMovies, hasTmdbApiKey } from '../services/tmdb.js';
import { debounce } from '../utils/debounce.js';
import { filterAllowedMovies, isQueryUnsafe } from '../utils/safety.js';
import { Sparkles, TrendingUp, Search as SearchIcon, Key } from 'lucide-react';

export default function Home({ favorites = [], onToggleFavorite }) {
  // Search Input State (Immediate UI feedback)
  const [searchInput, setSearchInput] = useState('');
  // Active Debounced Query used for TMDB API calls
  const [activeQuery, setActiveQuery] = useState('');

  // Movie Collection & Pagination State
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Async Status Flags
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState(null);

  // References for In-flight Cancellation and Observer Sentinel
  const abortControllerRef = useRef(null);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);

  /**
   * Primary Movie Fetcher (Page 1 initialization or Page N+1 appending)
   */
  const loadMovies = useCallback(async (targetQuery, targetPage, isAppend = false) => {
    // 1. NAYA CODE: Guard against explicit search keywords
    if (targetQuery && isQueryUnsafe(targetQuery)) {
      setMovies([]);
      setTotalPages(1);
      setTotalResults(0);
      setIsLoading(false);
      setIsFetchingNextPage(false);
      setError('Search blocked: 18+ and sexually explicit terms are not allowed.');
      return;
    }

    // Check if TMDB API key is configured before initiating requests
    if (!hasTmdbApiKey()) {
      setIsLoading(false);
      setIsFetchingNextPage(false);
      setError('TMDB API key is not configured. Add VITE_TMDB_KEY to the environment and restart the application.');
      return;
    }

    // Abort previous in-flight request to prevent search race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isAppend) {
      setIsFetchingNextPage(true);
    } else {
      setIsLoading(true);
      setError(null);
    }
    isFetchingRef.current = true;

    try {
      let data;
      const isSearch = Boolean(targetQuery && targetQuery.trim());

      if (isSearch) {
        data = await searchMovies(targetQuery, targetPage, controller.signal);
      } else {
        data = await getPopularMovies(targetPage, controller.signal);
      }

      // Safe Content Filter: Exclude adult or non-compliant content before state
      const allowedResults = await filterAllowedMovies(data.results, controller.signal);

      setTotalPages(data.total_pages);
      setTotalResults(data.total_results);
      setPage(data.page);

      if (isAppend) {
        // Append results immutably without replacing previous list
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNew = allowedResults.filter((m) => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setMovies(allowedResults);
      }
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request aborted due to a newer query; ignore quietly
        return;
      }
      console.error('Failed to load movies:', err);
      setError(err.message || 'Failed to fetch movies from TMDB.');
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
      isFetchingRef.current = false;
    }
  }, []);

  /**
   * Debounced function for search execution (500ms delay per Sprint Requirement)
   */
  const debouncedSearch = useRef(
    debounce((query) => {
      setActiveQuery(query);
    }, 500)
  ).current;

  // Handle Search Input Changes
  const handleSearchChange = (newVal) => {
    setSearchInput(newVal);
    debouncedSearch(newVal);
  };

  // Clear Search Handler
  const handleClearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    debouncedSearch.cancel();
  };

  // Trigger Page 1 when Active Query changes (Mode switch between Popular & Search)
  useEffect(() => {
    setPage(1);
    loadMovies(activeQuery, 1, false);
  }, [activeQuery, loadMovies]);

  /**
   * Native IntersectionObserver for Infinite Scrolling
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          !isFetchingRef.current &&
          !isLoading &&
          page < totalPages
        ) {
          const nextPage = page + 1;
          loadMovies(activeQuery, nextPage, true);
        }
      },
      {
        root: null,
        rootMargin: '250px', // Pre-fetch before user reaches the absolute bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [page, totalPages, isLoading, activeQuery, loadMovies]);

  const hasMore = page < totalPages;
  const isSearchMode = Boolean(activeQuery.trim());
  const isKeyMissingError = error && error.toLowerCase().includes('api key');

  return (
    <div className="space-y-8">
      {/* Search Header Hero */}
      <section className="text-center space-y-4 pt-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
          Explore Cinema with <span className="text-amber-400">Cine Stream</span>
        </h1>

        <div className="pt-2">
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            isLoading={isLoading && Boolean(searchInput)}
          />
        </div>
      </section>

      {/* AI Mood Matcher Panel */}
      <MoodMatcher
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Mode Title & Meta Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          {isSearchMode ? (
            <>
              <SearchIcon className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Search Results for <span className="text-amber-400">"{activeQuery}"</span>
              </h2>
            </>
          ) : (
            <>
              <TrendingUp className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Popular Movies Feed</h2>
            </>
          )}
        </div>

        <div className="text-xs text-neutral-400 flex items-center gap-3">
          {totalResults > 0 && (
            <span>
              Showing <strong className="text-neutral-200">{movies.length}</strong> of{' '}
              <strong className="text-neutral-200">{totalResults.toLocaleString()}</strong> safe titles
            </span>
          )}
          <span className="text-neutral-600">•</span>
          <span>Page {page} of {totalPages}</span>
        </div>
      </div>

      {/* Key Configuration Notice */}
      {isKeyMissingError && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Key className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-amber-300">TMDB API Key Setup Required</h3>
          <p className="mt-1 text-xs text-neutral-300 max-w-md mx-auto">
            To query real-time movies from The Movie Database, configure your TMDB API v3 key as{' '}
            <code className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-amber-400">VITE_TMDB_KEY</code> in your environment.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isKeyMissingError && (
        <ErrorMessage
          message={error}
          onRetry={() => loadMovies(activeQuery, page, false)}
        />
      )}

      {/* Initial Loading Spinner */}
      {isLoading && movies.length === 0 && !error && (
        <LoadingSpinner message={isSearchMode ? 'Searching TMDB database...' : 'Loading popular movies...'} />
      )}

      {/* Empty State (No movies found) */}
      {!isLoading && movies.length === 0 && !error && (
        <EmptyState
          title={isSearchMode ? `No suitable movies found for "${activeQuery}"` : 'No Movies Available'}
          description="Try checking for spelling errors or search for another title like Batman, Interstellar, or Marvel."
          actionText={isSearchMode ? 'Clear Search' : 'Refresh Feed'}
          onAction={isSearchMode ? handleClearSearch : () => loadMovies('', 1, false)}
        />
      )}

      {/* Populated Movie Grid */}
      {movies.length > 0 && (
        <MovieGrid
          movies={movies}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {/* Infinite Scroll Bottom Sentinel & Pagination Spinner */}
      <div ref={sentinelRef} id="infinite-scroll-sentinel" className="h-12 flex items-center justify-center">
        {isFetchingNextPage && (
          <LoadingSpinner size="small" message="Hydrating next page of movies..." />
        )}
        {!hasMore && movies.length > 0 && (
          <p className="text-xs text-neutral-500 font-medium">
            You've reached the end of the TMDB catalog for this query.
          </p>
        )}
      </div>
    </div>
  );
}