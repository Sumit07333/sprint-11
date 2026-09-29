import React, { useState } from 'react';
import { Sparkles, Compass, Loader2, X, RefreshCw } from 'lucide-react';
import MovieCard from './MovieCard.jsx';
import { getMovieByMood } from '../services/ai.js';
import { hasTmdbApiKey } from '../services/tmdb.js';

const MOOD_PRESETS = [
  'Need a high-octane adrenaline rush',
  'Feeling down, need a heartwarming laugh',
  'Mind-bending sci-fi mystery',
  'Cozy rainy-day nostalgic adventure',
  'Intense psychological thriller',
];

export default function MoodMatcher({ favorites = [], onToggleFavorite }) {
  const [isOpen, setIsOpen] = useState(false);
  const [moodInput, setMoodInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const favoritedIds = new Set(favorites.map((m) => String(m.id)));

  const handleMatchMood = async (queryText) => {
    const text = (queryText || moodInput).trim();
    if (!text) return;

    if (!hasTmdbApiKey()) {
      setError('TMDB API key is not configured. Add VITE_TMDB_KEY to the environment and restart the application.');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const match = await getMovieByMood(text);
      if (!match.movie) {
        setError('No suitable movie recommendation was found.');
        setResult(null);
      } else {
        setResult(match);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to generate an AI movie recommendation. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
    setMoodInput('');
  };

  return (
    <section
      aria-label="AI Mood Matcher"
      className="overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-amber-950/20 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20">
            <Sparkles className="h-5 w-5 fill-neutral-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">AI Mood Matcher</h2>
            </div>
            <p className="text-xs text-neutral-400">
              Describe your mood or vibe — Gemini AI identifies the title and searches TMDB.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="toggle-mood-matcher-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
        >
          <Compass className="h-3.5 w-3.5 text-amber-400" />
          <span>{isOpen ? 'Collapse Panel' : 'Match My Mood'}</span>
        </button>
      </div>

      {/* Expanded Interactive Area */}
      {isOpen && (
        <div className="mt-5 space-y-4 border-t border-neutral-800/80 pt-5">
          {/* Quick Presets */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Quick Mood Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setMoodInput(preset);
                    handleMatchMood(preset);
                  }}
                  disabled={isLoading}
                  className="rounded-lg border border-neutral-700/80 bg-neutral-800/50 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-amber-400/50 hover:bg-neutral-800 hover:text-amber-300 transition-all disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMatchMood();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              id="custom-mood-input"
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              placeholder="e.g. I am feeling nostalgic and want a 90s sci-fi film..."
              className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950/80 px-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />

            <button
              type="submit"
              id="submit-mood-btn"
              disabled={isLoading || !moodInput.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-md shadow-amber-400/20 hover:bg-amber-300 disabled:opacity-50 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-950" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-neutral-950" />
                  <span>Find Match</span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-3 text-xs text-red-300 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Recommendation Result Card */}
          {result && result.movie && (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs font-semibold text-amber-300">
                    AI Pick for you: <strong className="text-white font-bold">"{result.recommendedTitle}"</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Clear Result</span>
                </button>
              </div>

              <div className="max-w-xs mx-auto sm:mx-0">
                <MovieCard
                  movie={result.movie}
                  isFavorited={favoritedIds.has(String(result.movie.id))}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
