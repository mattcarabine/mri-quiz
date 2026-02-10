import { useState, useCallback } from 'react';

/**
 * Generic hook for localStorage persistence with SSR safety and error handling.
 *
 * @param key - localStorage key
 * @param initialValue - fallback value if localStorage is unavailable or corrupted
 * @returns tuple of [value, setter]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR safety check
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error (corrupted data), return initial value
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Stable setter that doesn't cause unnecessary re-renders
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        // Handle quota exceeded error gracefully
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn(`localStorage quota exceeded for key "${key}". Attempting to clear old data...`);
          try {
            // Try to clear some old localStorage data
            const keysToRemove = Object.keys(localStorage).filter(
              (k) => k.startsWith('quiz-') && k !== key
            );
            keysToRemove.forEach((k) => localStorage.removeItem(k));
            // Try again after clearing
            window.localStorage.setItem(key, JSON.stringify(value instanceof Function ? value(storedValue) : value));
          } catch (retryError) {
            console.error(`Failed to save to localStorage even after clearing: ${retryError}`);
          }
        } else {
          console.warn(`Error setting localStorage key "${key}":`, error);
        }
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
