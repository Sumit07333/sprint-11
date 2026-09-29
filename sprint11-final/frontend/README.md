# Cine Stream — Media Discovery SPA

Cine Stream is a high-performance Media Discovery Single Page Application (SPA) built with pure JavaScript (React) and powered by The Movie Database (TMDB) REST API and Gemini AI.

---

## Features

- **TMDB Popular Discovery**: Real-time discovery feed fetching the latest popular films from TMDB.
- **Debounced Live Search**: Real-time search powered by a strict 500ms debounce timer with `AbortController` cancellation to eliminate race conditions.
- **Infinite Scrolling**: Native `IntersectionObserver` observing a bottom sentinel to seamlessly hydrate data page-by-page.
- **Favorites Persistence**: Full movie object storage in `localStorage` with real-time cross-view synchronization across `/` and `/favorites`.
- **Safe Content Filter**: Cine Stream uses layered TMDB metadata, certification, keyword, and application-level safety checks to avoid intentionally displaying clearly explicit, adult, or nudity-focused content.
- **Missing Asset Resiliency**: Graceful 2:3 aspect ratio SVG fallbacks preventing broken `.../null` image links and layout shifts.
- **Native Image Lazy Loading**: `loading="lazy"` on all movie posters to optimize bandwidth and DOM rendering.
- **AI Mood Matcher (Phase 3)**: Secure server-side Gemini AI integration (`/api/mood`) that transforms contextual moods into a single movie title and queries TMDB with content safety verification.

---

## Tech Stack

- **Frontend**: React (JavaScript/JSX), React Router, Tailwind CSS, Lucide React
- **Data Source**: TMDB (The Movie Database) REST API
- **AI Intelligence**: Google Gemini API (@google/genai)
- **Performance**: Native `IntersectionObserver`, custom 500ms Debounce utility, `AbortController`

---

## Environment Setup

Create a `.env` file in the project root:

```env
# TMDB API Key (v3) - Required for live TMDB movie queries
VITE_TMDB_KEY=your_tmdb_api_key_here

# Gemini API Key - Server-side only for AI Mood Matcher
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server (Port 3000)
npm run dev

# Build for production
npm run build
```

---

## 3-Minute Demo Guide

1. **Popular Movies**: Launch the app and show real-time TMDB popular movies rendering on the responsive grid.
2. **Debounced Search**: Open DevTools Network tab, search `"Batman"`, and show that requests fire only after pausing for 500ms.
3. **Infinite Scroll**: Scroll to the bottom of the page to trigger the `IntersectionObserver` sentinel and show new pages appending without overwriting previous cards.
4. **Favorites**: Click the heart on a movie card, navigate to `/favorites`, verify persistence on page refresh, and toggle off.
5. **AI Mood Matcher**: Click "Match My Mood", select a preset or type a feeling (e.g., `"Heartwarming comedy"`), and view the sanitized TMDB match.
