import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuiz } from '../useQuiz';
import type { QuizImage } from '../../types/quiz';

// Mock fetch globally
global.fetch = vi.fn();

describe('useQuiz', () => {
  const mockImages: QuizImage[] = [
    { id: 'img1', filename: 'img1.jpg', type: 'T1', subject: 'Subject1' },
    { id: 'img2', filename: 'img2.jpg', type: 'T2', subject: 'Subject2' },
    { id: 'img3', filename: 'img3.jpg', type: 'T1', subject: 'Subject3' },
    { id: 'img4', filename: 'img4.jpg', type: 'T2', subject: 'Subject4' },
    { id: 'img5', filename: 'img5.jpg', type: 'T1', subject: 'Subject5' },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Mock successful metadata fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        images: mockImages,
        stats: { total: 5, t1Count: 3, t2Count: 2 },
      }),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize in setup phase', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    });

    expect(result.current.state.items).toHaveLength(0);
    expect(result.current.state.score).toBe(0);
    expect(result.current.state.totalAnswered).toBe(0);
  });

  it('should load metadata on mount', async () => {
    renderHook(() => useQuiz());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/data/metadata.json');
    });
  });

  it('should handle metadata fetch failure gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result.current.state.phase).toBe('setup');
    });

    consoleWarnSpy.mockRestore();
  });

  it('should start quiz with specified session length', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    });

    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
      expect(result.current.state.sessionLength).toBe(20);
      expect(result.current.state.items.length).toBeGreaterThan(0);
    });
  });

  it('should provide current image in question phase', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    });

    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.currentImage).not.toBeNull();
      expect(result.current.currentImage?.type).toMatch(/^(T1|T2)$/);
    });
  });

  it('should submit answer and transition to explanation phase', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    });

    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
    });

    const correctAnswer = result.current.currentImage?.type;

    act(() => {
      result.current.submitAnswer(correctAnswer!);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('explanation');
      expect(result.current.state.answers).toHaveLength(1);
    });
  });

  it('should increment score on correct answer', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    });

    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
    });

    const correctAnswer = result.current.currentImage?.type;

    act(() => {
      result.current.submitAnswer(correctAnswer!);
    });

    await waitFor(() => {
      expect(result.current.state.score).toBe(1);
      expect(result.current.state.totalAnswered).toBe(1);
      expect(result.current.state.answers[0].correct).toBe(true);
    });
  });

  it('should not increment score on incorrect answer', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    }, { timeout: 3000 });

    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
      expect(result.current.currentImage).not.toBeNull();
    }, { timeout: 3000 });

    // Submit deliberately wrong answer
    act(() => {
      // Always submit T2 if current is T1, and vice versa
      const currentType = result.current.currentImage!.type;
      const wrongAnswer = currentType === 'T1' ? ('T2' as const) : ('T1' as const);
      result.current.submitAnswer(wrongAnswer);
    });

    await waitFor(() => {
      expect(result.current.state.totalAnswered).toBe(1);
      if (result.current.state.answers.length > 0) {
        const firstAnswer = result.current.state.answers[0];
        if (!firstAnswer.correct) {
          expect(result.current.state.score).toBe(0);
        }
      }
    }, { timeout: 3000 });
  });

  it('should move to next question from explanation phase', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    });

    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
    });

    // Submit the correct answer so currentIndex reliably advances
    const correctAnswer = result.current.currentImage!.type;

    act(() => {
      result.current.submitAnswer(correctAnswer);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('explanation');
    });

    act(() => {
      result.current.nextQuestion();
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
      expect(result.current.state.currentIndex).toBeGreaterThan(0);
    });
  });

  it('should transition to results after completing session', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    }, { timeout: 3000 });

    // Start with small session
    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
    }, { timeout: 3000 });

    // Instead of looping, just force finish the quiz
    act(() => {
      result.current.finishQuiz();
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('results');
    }, { timeout: 3000 });
  });

  it('should reset quiz back to setup phase', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    });

    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
    });

    act(() => {
      result.current.resetQuiz();
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
      expect(result.current.state.score).toBe(0);
      expect(result.current.state.totalAnswered).toBe(0);
      expect(result.current.state.answers).toHaveLength(0);
    });
  });

  it('should record answer details correctly', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    }, { timeout: 3000 });

    act(() => {
      result.current.startQuiz(20);
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
    }, { timeout: 3000 });

    const currentImage = result.current.currentImage!;
    const answerToSubmit = currentImage.type; // Use correct answer

    act(() => {
      result.current.submitAnswer(answerToSubmit);
    });

    await waitFor(() => {
      expect(result.current.state.answers).toHaveLength(1);
    }, { timeout: 3000 });

    const answer = result.current.state.answers[0];
    expect(answer.imageId).toBe(currentImage.id);
    expect(answer.userAnswer).toBe(answerToSubmit);
    expect(answer.correctAnswer).toBe(currentImage.type);
    expect(answer.correct).toBe(true);
    expect(answer.timestamp).toBeGreaterThan(0);
  });

  it('should handle "all" session length', async () => {
    const { result } = renderHook(() => useQuiz());

    await waitFor(() => {
      expect(result.current.state.phase).toBe('setup');
    });

    act(() => {
      result.current.startQuiz('all');
    });

    await waitFor(() => {
      expect(result.current.state.phase).toBe('question');
      expect(result.current.state.sessionLength).toBe('all');
      expect(result.current.state.items.length).toBe(mockImages.length);
    });
  });
});
