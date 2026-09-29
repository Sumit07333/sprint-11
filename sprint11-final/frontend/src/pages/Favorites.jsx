import React from 'react';
import { NavLink } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { filterAllowedMoviesSync } from '../utils/safety.js';
import { Heart, Film, ArrowLeft } from 'lucide-react';

export default function Favorites({ favorites = [], onToggleFavorite }) {
  const safeFavorites = filterAllowedMoviesSync(favorites);
  const hasFavorites = safeFavorites && safeFavorites.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
              My Saved Favorites
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            Locally persisted in browser storage. Survives page reloads and refreshes.
          </p>
        </div>

        <NavLink
          to="/"
          id="back-to-discover-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-200 border border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Discover</span>
        </NavLink>
      </div>

      {/* Favorites Count Summary */}
      {hasFavorites && (
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>
            Showing <strong className="text-neutral-200">{safeFavorites.length}</strong> saved{' '}
            {safeFavorites.length === 1 ? 'movie' : 'movies'}
          </span>
          <span className="text-neutral-500">Stored via localStorage</span>
        </div>
      )}

      {/* Grid or Empty State */}
      {hasFavorites ? (
        <MovieGrid
          movies={safeFavorites}
          favorites={safeFavorites}
          onToggleFavorite={onToggleFavorite}
        />
      ) : (
        <EmptyState
          icon={Heart}
          title="No Favorite Movies Yet"
          description="You haven't saved any movies to your favorites. Browse the popular catalog or search for a title and click the heart icon on any movie card."
          actionText="Explore Popular Movies"
          onAction={() => {
            window.location.href = '/';
          }}
        />
      )}
    </div>
  );
}
