import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-lg rounded-2xl border border-red-900/40 bg-red-950/30 p-6 text-center shadow-xl backdrop-blur-md"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-red-200">{title}</h3>
      <p className="mt-1.5 text-xs text-red-300/80 leading-relaxed">
        {message || 'Unable to retrieve movie data from TMDB. Please check your network or API key.'}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600/80 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
