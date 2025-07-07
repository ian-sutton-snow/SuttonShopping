'use client';

import { useState, useEffect } from 'react';

type Orientation = 'portrait' | 'landscape';

const getOrientation = (): Orientation => {
  if (typeof window === 'undefined') {
    return 'portrait'; // Default for SSR
  }
  return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
};

export function useScreenOrientation() {
  const [orientation, setOrientation] = useState<Orientation>(getOrientation());

  useEffect(() => {
    const checkOrientation = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'portrait' : 'landscape');
    };

    const mediaQuery = window.matchMedia('(orientation: portrait)');
    
    setOrientation(mediaQuery.matches ? 'portrait' : 'landscape');
    
    mediaQuery.addEventListener('change', checkOrientation);

    return () => {
      mediaQuery.removeEventListener('change', checkOrientation);
    };
  }, []);

  return orientation;
}
