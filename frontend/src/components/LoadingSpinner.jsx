import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizes[size]} rounded-full border-2 border-pink-900/30 border-t-pink-500 animate-spin`} />
      {text && <p className="text-sm font-medium text-pink-300">{text}</p>}
    </div>
  );
}
