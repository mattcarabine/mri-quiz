import { useEffect } from 'react';
import type { QuizItem } from '../types/quiz';

/**
 * Hook to preload upcoming images in the background for smooth UX.
 * Preloads next 2-3 images when currentIndex changes.
 */
export function useImagePreloader(items: QuizItem[], currentIndex: number) {
  useEffect(() => {
    // Preload next 2-3 images
    const imagesToPreload = 3;
    const startIndex = currentIndex + 1;
    const endIndex = Math.min(startIndex + imagesToPreload, items.length);

    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];
      if (item) {
        const imageUrl = `/images/${item.image.type.toLowerCase()}/${item.image.filename}`;
        const img = new Image();
        img.src = imageUrl;
        // Image will be cached by the browser for later use
      }
    }
  }, [items, currentIndex]);
}
