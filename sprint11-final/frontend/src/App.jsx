import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Favorites from './pages/Favorites.jsx';
import { getFavorites, toggleFavorite, auditAndCleanFavorites } from './utils/favorites.js';

export default function App() {
  const [favorites, setFavorites] = useState(() => getFavorites());

  // Listen for storage events and internal updates to keep favorites synchronized
  useEffect(() => {
    const handleFavoritesSync = () => {
      setFavorites(getFavorites());
    };

    window.addEventListener('storage', handleFavoritesSync);
    window.addEventListener('cine_stream_favorites_updated', handleFavoritesSync);

    // Asynchronously audit existing favorites against TMDB certification data on launch
    auditAndCleanFavorites().then((cleaned) => {
      if (cleaned) {
        setFavorites(cleaned);
      }
    });

    return () => {
      window.removeEventListener('storage', handleFavoritesSync);
      window.removeEventListener('cine_stream_favorites_updated', handleFavoritesSync);
    };
  }, []);

  const handleToggleFavorite = async (movie) => {
    const updated = await toggleFavorite(movie);
    setFavorites(updated);
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 font-sans antialiased">
        {/* Persistent Navigation Bar */}
        <Navbar favoritesCount={favorites.length} />

        {/* Main Routed Content Area */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <Favorites
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-800 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Cine Stream © {new Date().getFullYear()} • Data provided by{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline"
              >
                TMDB
              </a>
            </p>
            <p className="font-mono text-[11px] text-neutral-400">
              500ms Debounce • IntersectionObserver • localStorage
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
