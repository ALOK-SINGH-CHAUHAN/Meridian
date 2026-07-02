import React from 'react';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 animate-in fade-in duration-200">
      {children}
    </div>
  );
}
