import { useReducer, useEffect, useCallback, useMemo } from 'react';
import type { QuizState, QuizAction, QuizImage, QuizItem, SessionLength, ImageMetadata } from '../types/quiz';
import { buildQueue } from '../lib/imageQueue';
import { useLocalStorage } from './useLocalStorage';
import sampleMetadata from '../data/metadata.sample.json';

// Sample fallback data in case metadata.json fails to load
const SAMPLE_IMAGES: QuizImage[] = sampleMetadata.images as QuizImage[];

// Initial quiz state
const initialState: QuizState = {
  items: [],
  currentIndex: 0,
  sessionLength: 20,
  answers: [],
  phase: 'setup',
  score: 0,
  totalAnswered: 0,
};

/**
 * Reducer to manage quiz state transitions.
 */
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ': {
      const items = buildQueue(action.images, action.sessionLength);

      return {
        ...state,
        items,
        currentIndex: 0,
        sessionLength: action.sessionLength,
        answers: [],
        phase: 'question',
        score: 0,
        totalAnswered: 0,
      };
    }

    case 'ANSWER': {
      const currentItem = state.items[state.currentIndex];
      if (!currentItem) return state;

      const correct = action.answer === currentItem.image.type;
      const answerRecord = {
        imageId: currentItem.image.id,
        correct,
        userAnswer: action.answer,
        correctAnswer: currentItem.image.type,
        timestamp: Date.now(),
      };

      return {
        ...state,
        answers: [...state.answers, answerRecord],
        score: correct ? state.score + 1 : state.score,
        totalAnswered: state.totalAnswered + 1,
        phase: 'explanation',
      };
    }

    case 'NEXT_QUESTION': {
      const sessionTotal = state.sessionLength === 'all' ? state.items.length : state.sessionLength;
      if (state.totalAnswered >= sessionTotal) {
        return { ...state, phase: 'results' };
      }

      const updatedItems = [...state.items];
      let nextIndex = state.currentIndex + 1;
      const lastAnswer = state.answers[state.answers.length - 1];
      const currentItem = updatedItems[state.currentIndex];

      // Apply inline SM-2 update for the item just answered
      // (intentionally differs from spacedRepetition.updateItem: immediate re-review on miss, no priority boost)
      if (lastAnswer && currentItem && lastAnswer.imageId === currentItem.image.id) {
        const { correct } = lastAnswer;
        const now = Date.now();

        const updatedItem: QuizItem = {
          ...currentItem,
          lastSeen: now,
          repetitions: correct ? currentItem.repetitions + 1 : 0,
          consecutiveCorrect: correct ? currentItem.consecutiveCorrect + 1 : 0,
        };

        if (correct) {
          if (currentItem.repetitions === 0) {
            updatedItem.interval = 1;
          } else if (currentItem.repetitions === 1) {
            updatedItem.interval = 6;
          } else {
            updatedItem.interval = Math.round(currentItem.interval * currentItem.easeFactor);
          }
          updatedItem.nextReview = now + updatedItem.interval * 24 * 60 * 60 * 1000;
        } else {
          updatedItem.interval = 1;
          updatedItem.nextReview = now;
          updatedItem.easeFactor = Math.max(1.3, currentItem.easeFactor - 0.2);
        }

        updatedItems[state.currentIndex] = updatedItem;

        // Reinsert missed items 3-7 positions ahead; the splice shifts the next
        // item into currentIndex, so nextIndex stays put
        if (!correct) {
          const offset = Math.floor(Math.random() * 5) + 3;
          const [missed] = updatedItems.splice(state.currentIndex, 1);
          const insertAt = Math.min(state.currentIndex + offset, updatedItems.length);
          updatedItems.splice(insertAt, 0, missed);
          nextIndex = state.currentIndex;
        }
      }

      return { ...state, items: updatedItems, currentIndex: nextIndex, phase: 'question' };
    }

    case 'FINISH_QUIZ': {
      return {
        ...state,
        phase: 'results',
      };
    }

    case 'RESET': {
      return {
        ...initialState,
        phase: 'setup',
      };
    }

    default:
      return state;
  }
}

/**
 * Main quiz state management hook with useReducer.
 * Manages quiz lifecycle: setup → question → explanation → results.
 * Persists state to localStorage.
 * Integrates spaced repetition algorithm.
 */
export function useQuiz() {
  // Load metadata on mount
  const [metadata, setMetadata] = useLocalStorage<ImageMetadata | null>('quiz-metadata', null);
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const [persistedState, setPersistedState] = useLocalStorage<QuizState>('quiz-state', initialState);

  // Load metadata from JSON file on mount
  useEffect(() => {
    if (metadata) return; // Already loaded

    fetch('/data/metadata.json')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load metadata');
        return response.json();
      })
      .then((data: ImageMetadata) => {
        setMetadata(data);
      })
      .catch((error) => {
        console.warn('Failed to load metadata, using sample data:', error);
        setMetadata({
          images: SAMPLE_IMAGES,
          stats: { total: SAMPLE_IMAGES.length, t1Count: 1, t2Count: 1 },
        });
      });
  }, [metadata, setMetadata]);

  // Restore persisted state on mount
  useEffect(() => {
    if (persistedState && persistedState.phase !== 'setup') {
      // Restore the persisted state by replaying it
      // Note: This is a simple restore; in production you might want more sophisticated hydration
      Object.assign(state, persistedState);
    }
  }, []); // Only run on mount

  // Persist state changes to localStorage
  useEffect(() => {
    if (state.phase !== 'setup' || state.items.length > 0) {
      setPersistedState(state);
    }
  }, [state, setPersistedState]);

  /**
   * Start a new quiz session.
   */
  const startQuiz = useCallback(
    (length: SessionLength) => {
      if (!metadata?.images.length) {
        console.warn('Cannot start quiz: no images loaded');
        return;
      }

      dispatch({
        type: 'START_QUIZ',
        sessionLength: length,
        images: metadata.images,
      });
    },
    [metadata]
  );

  /**
   * Submit an answer for the current question.
   */
  const submitAnswer = useCallback(
    (answer: 'T1' | 'T2') => {
      if (state.phase !== 'question') return;

      // Only dispatch the answer to update score and phase
      // Do NOT modify items array here - that would change currentIndex reference
      dispatch({ type: 'ANSWER', answer });
    },
    [state.phase]
  );

  /**
   * Move to the next question.
   */
  const nextQuestion = useCallback(() => {
    if (state.phase !== 'explanation') return;
    dispatch({ type: 'NEXT_QUESTION' });
  }, [state.phase]);

  /**
   * Force finish the quiz and show results.
   */
  const finishQuiz = useCallback(() => {
    dispatch({ type: 'FINISH_QUIZ' });
  }, []);

  /**
   * Reset quiz back to setup phase.
   */
  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET' });
    setPersistedState(initialState);
  }, [setPersistedState]);

  const currentImage = useMemo(
    () => state.items[state.currentIndex]?.image ?? null,
    [state.items, state.currentIndex],
  );

  return {
    state,
    startQuiz,
    submitAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
    currentImage,
    metadata,
  };
}
