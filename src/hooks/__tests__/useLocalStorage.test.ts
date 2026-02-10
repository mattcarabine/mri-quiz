import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return initialValue when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should save value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new value'));
  });

  it('should retrieve existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('stored value');
  });

  it('should handle complex objects', () => {
    const complexObject = {
      id: 1,
      name: 'Test',
      items: [1, 2, 3],
      nested: { value: true },
    };

    const { result } = renderHook(() => useLocalStorage('test-key', complexObject));

    act(() => {
      result.current[1]({ ...complexObject, name: 'Updated' });
    });

    expect(result.current[0]).toEqual({ ...complexObject, name: 'Updated' });

    const stored = JSON.parse(localStorage.getItem('test-key') || '{}');
    expect(stored.name).toBe('Updated');
  });

  it('should handle functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 5));

    act(() => {
      result.current[1]((prev) => prev + 10);
    });

    expect(result.current[0]).toBe(15);
  });

  it('should return initialValue when localStorage contains corrupted data', () => {
    // Set invalid JSON
    localStorage.setItem('test-key', 'invalid json {[}');

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

    expect(result.current[0]).toBe('fallback');
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should handle localStorage quota exceeded gracefully', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    let callCount = 0;
    // Mock localStorage.setItem to throw QuotaExceededError on all attempts
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      callCount++;
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      throw error;
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current[1]('new value');
    });

    // State should update even if localStorage fails
    expect(result.current[0]).toBe('new value');
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(callCount).toBeGreaterThan(0); // Should have attempted to save

    setItemSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should work with different keys independently', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
    const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

    act(() => {
      result1.current[1]('updated1');
      result2.current[1]('updated2');
    });

    expect(result1.current[0]).toBe('updated1');
    expect(result2.current[0]).toBe('updated2');
    expect(localStorage.getItem('key1')).toBe(JSON.stringify('updated1'));
    expect(localStorage.getItem('key2')).toBe(JSON.stringify('updated2'));
  });

  it('should handle null and undefined values', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('test-key', null));

    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1]('not null');
    });

    expect(result.current[0]).toBe('not null');

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
  });

  it('should handle arrays', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('test-key', []));

    expect(result.current[0]).toEqual([]);

    act(() => {
      result.current[1]([1, 2, 3]);
    });

    expect(result.current[0]).toEqual([1, 2, 3]);

    act(() => {
      result.current[1]((prev) => [...prev, 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });

  it('should handle boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(JSON.parse(localStorage.getItem('test-key') || 'false')).toBe(true);
  });
});
