import { useState, useEffect } from 'react';

const SCROLL_THRESHOLD = 50;

export function useScrollVisibility(enabled: boolean = true): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Update visibility based on scroll position
        if (currentScrollY > SCROLL_THRESHOLD) {
          if (isVisible) {
            setIsVisible(false);
          }
        } else {
          if (!isVisible) {
            setIsVisible(true);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [enabled, isVisible]);

  return isVisible;
}
