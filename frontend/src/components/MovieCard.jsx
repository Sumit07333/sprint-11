import React from 'react';
import { Star, Heart } from 'lucide-react';
import { getPosterUrl, formatReleaseYear, formatRating } from '../services/tmdb.js';

export default function MovieCard({ movie, isFavorited = false, onToggleFavorite }) {
  if (!movie) return null;

  const posterUrl = getPosterUrl(movie.poster_path);
  const releaseYear = formatReleaseYear(movie.release_date);
  const rating = formatRating(movie.vote_average);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(movie);
    }
  };

  return (
    <article
      id={`movie-card-${movie.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/80 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/50"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
        <img
          src={posterUrl}
          alt={`Poster for ${movie.title || 'Movie'}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Guard against any network image failure by falling back to local SVG
            if (e.currentTarget.src !== window.location.origin + '/placeholder-poster.svg') {
              e.currentTarget.src = '/placeholder-poster.svg';
            }
          }}
        />

        {/* Top Badges (Rating & Favorite Button) */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 bg-gradient-to-b from-neutral-950/80 via-neutral-950/40 to-transparent">
          {/* TMDB Rating Badge */}
          <div className="flex items-center gap-1 rounded-md bg-neutral-950/80 px-2 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-neutral-700/60 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            id={`fav-btn-${movie.id}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isFavorited
                ? 'bg-red-500/90 text-white shadow-md shadow-red-500/30'
                : 'bg-neutral-950/70 text-neutral-300 hover:bg-neutral-900 hover:text-white border border-neutral-700/60'
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorited ? 'fill-current text-white' : 'hover:text-red-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          <h3
            className="text-base font-bold leading-snug text-neutral-100 line-clamp-1 group-hover:text-amber-400 transition-colors"
            title={movie.title}
          >
            {movie.title || 'Untitled'}
          </h3>
          <div className="mt-1 flex items-center justify-between text-xs text-neutral-400">
            <span className="font-medium">{releaseYear}</span>
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider">TMDB #{movie.id}</span>
          </div>
        </div>

        {movie.overview && (
          <p className="mt-2.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {movie.overview}
          </p>
        )}
      </div>
    </article>
  );
}
