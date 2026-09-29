import React from 'react';
import { Film, Sparkles } from 'lucide-react';

export default function EmptyState({
  title = 'No Movies Found',
  description = 'We couldn\'t find any movies matching your search criteria.',
  actionText,
  onAction,
  icon: Icon = Film,
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 text-center backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400 border border-neutral-700 shadow-inner">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-neutral-200">{title}</h3>
      <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed max-w-xs">{description}</p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-transform active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
