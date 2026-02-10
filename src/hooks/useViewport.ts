import { useState, useEffect } from 'react';

interface ViewportState {
  isTablet: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  width: number;
}

const TABLET_MIN = 768;
const TABLET_MAX = 1024;

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    // SSR-safe initial state
    if (typeof window === 'undefined') {
      return {
        isTablet: false,
        isMobile: false,
        isDesktop: true,
        width: 1920,
      };
    }

    const width = window.innerWidth;
    return {
      isTablet: width >= TABLET_MIN && width <= TABLET_MAX,
      isMobile: width < TABLET_MIN,
      isDesktop: width > TABLET_MAX,
      width,
    };
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      // Debounce resize events to 150ms
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        setViewport({
          isTablet: width >= TABLET_MIN && width <= TABLET_MAX,
          isMobile: width < TABLET_MIN,
          isDesktop: width > TABLET_MAX,
          width,
        });
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewport;
}
