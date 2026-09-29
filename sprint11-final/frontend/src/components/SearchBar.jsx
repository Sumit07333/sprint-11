import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, isLoading = false }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        {/* Left Search Icon or Loading Spinner */}
        <div className="pointer-events-none absolute left-4 flex items-center justify-center text-neutral-400">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
          ) : (
            <Search className="h-5 w-5 text-neutral-400" />
          )}
        </div>

        {/* Search Input Field */}
        <input
          type="text"
          id="search-movie-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search TMDB movies (e.g. Batman, Inception, Dune)..."
          className="w-full rounded-2xl border border-neutral-700 bg-neutral-900/90 py-3.5 pl-12 pr-12 text-sm text-neutral-100 placeholder-neutral-500 shadow-lg shadow-black/40 backdrop-blur-md transition-all focus:border-amber-400 focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            id="clear-search-btn"
            onClick={onClear}
            aria-label="Clear search input"
            className="absolute right-3.5 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
