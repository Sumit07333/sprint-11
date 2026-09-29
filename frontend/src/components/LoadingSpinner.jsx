import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading movies...', size = 'default' }) {
  const isSmall = size === 'small';

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${isSmall ? 'py-6' : 'py-16'}`}>
      <div className="relative">
        <Loader2 className={`${isSmall ? 'h-6 w-6' : 'h-10 w-10'} animate-spin text-amber-400`} />
      </div>
      {message && (
        <p className={`font-medium text-neutral-400 ${isSmall ? 'text-xs' : 'text-sm'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
