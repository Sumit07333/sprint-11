import React from 'react';
import { NavLink } from 'react-router-dom';
import { Clapperboard, Film, Heart } from 'lucide-react';

export default function Navbar({ favoritesCount = 0 }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Title */}
        <NavLink
          to="/"
          id="nav-brand-link"
          className="flex items-center gap-2.5 group transition-transform focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Film className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                CINE<span className="text-amber-400">STREAM</span>
              </span>
              <span className="hidden sm:inline-flex items-center rounded-md bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/20">
                SPA
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">Media Discovery & Performance</p>
          </div>
        </NavLink>

        {/* Primary Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <NavLink
            to="/"
            end
            id="nav-home-btn"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`
            }
          >
            <Clapperboard className="h-4 w-4" />
            <span>Discover</span>
          </NavLink>

          <NavLink
            to="/favorites"
            id="nav-favorites-btn"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-neutral-800 text-red-400 shadow-sm border border-neutral-700'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`
            }
          >
            <Heart className="h-4 w-4 fill-current text-red-400" />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-bold text-neutral-950 bg-amber-400 rounded-full">
                {favoritesCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
