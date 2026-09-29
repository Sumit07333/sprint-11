import React from 'react';
import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies = [], favorites = [], onToggleFavorite }) {
  if (!movies || movies.length === 0) {
    return null;
  }

  // Create a fast-lookup Set of favorited movie IDs
  const favoritedIds = new Set(favorites.map((m) => String(m.id)));

  return (
    <section
      aria-label="Movie Results"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 sm:gap-6"
    >
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorited={favoritedIds.has(String(movie.id))}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </section>
  );
}
