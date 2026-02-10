import { useEffect } from 'react';
import { useQuiz } from '../../hooks/useQuiz';
import { useImagePreloader } from '../../hooks/useImagePreloader';
import { useViewport } from '../../hooks/useViewport';
import { useScrollVisibility } from '../../hooks/useScrollVisibility';
import { SessionSelector } from './SessionSelector';
import { ImageDisplay } from './ImageDisplay';
import { AnswerButtons } from './AnswerButtons';
import { QuizHeader } from './QuizHeader';
import { Explanation } from './Explanation';
import { ResultsScreen } from './ResultsScreen';
import type { QuizImage } from '../../types/quiz';

function ErrorState({ message, onReset }: { message: string; onReset?: () => void }) {
  return (
    <div className="text-center text-red-400 p-8">
      <p className="text-xl">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Return to Setup
        </button>
      )}
    </div>
  );
}

function getImageUrl(image: QuizImage): string {
  return `/images/${image.type.toLowerCase()}/${image.filename}`;
}

function QuitButton({ onClick, isFixed = false }: { onClick: () => void; isFixed?: boolean }) {
  if (isFixed) {
    return (
      <button
        onClick={onClick}
        className="fixed top-4 right-4 z-50 p-3 rounded-lg
                   text-gray-400 hover:text-gray-100
                   bg-gray-900/80 hover:bg-gray-800/90
                   backdrop-blur-sm shadow-elevated
                   transition-all"
        style={{
          top: 'calc(1rem + env(safe-area-inset-top, 0px))',
        }}
        aria-label="End quiz"
        title="End quiz"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
      aria-label="End quiz"
      title="End quiz"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
      </svg>
    </button>
  );
}

export function QuizContainer() {
  const { state, startQuiz, submitAnswer, nextQuestion, resetQuiz, currentImage, metadata } = useQuiz();
  const { isTablet } = useViewport();
  const isProgressVisible = useScrollVisibility(isTablet && (state.phase === 'question' || state.phase === 'explanation'));

  // Preload next 2-3 images for smooth UX
  useImagePreloader(state.items, state.currentIndex);

  // Reset scroll position on phase changes (tablet only)
  useEffect(() => {
    if (isTablet && (state.phase === 'question' || state.phase === 'explanation')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.phase, state.currentIndex, isTablet]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Question phase: 1 for T1, 2 for T2
      if (state.phase === 'question') {
        if (event.key === '1') {
          event.preventDefault();
          submitAnswer('T1');
        } else if (event.key === '2') {
          event.preventDefault();
          submitAnswer('T2');
        }
      }

      // Explanation phase: Enter to continue
      if (state.phase === 'explanation') {
        if (event.key === 'Enter') {
          event.preventDefault();
          nextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, submitAnswer, nextQuestion]);

  const sessionLength = state.sessionLength === 'all' ? state.items.length : state.sessionLength;

  // Loading state while metadata is being fetched
  if (!metadata && state.phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-lg">Loading quiz data...</p>
      </div>
    );
  }

  if (state.phase === 'setup') {
    return <SessionSelector onSelect={startQuiz} />;
  }

  if (state.phase === 'question') {
    if (!currentImage) {
      return <ErrorState message="Error: No current image available" onReset={resetQuiz} />;
    }

    const handleScrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isTablet) {
      return (
        <>
          <QuitButton onClick={resetQuiz} isFixed />
          <QuizHeader
            current={state.totalAnswered + 1}
            total={sessionLength}
            score={state.score}
            isTablet
            isVisible={isProgressVisible}
            showIndicator={!isProgressVisible}
            onScrollToTop={handleScrollToTop}
          />
          <div className="w-full max-w-4xl mx-auto px-4 pb-32">
            <ImageDisplay
              src={getImageUrl(currentImage)}
              alt={`MRI scan ${currentImage.id}`}
              loading={false}
              isTablet
            />
          </div>
          <AnswerButtons
            onAnswer={submitAnswer}
            disabled={false}
            isFixed
          />
        </>
      );
    }

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <QuizHeader
              current={state.totalAnswered + 1}
              total={sessionLength}
              score={state.score}
            />
          </div>
          <QuitButton onClick={resetQuiz} />
        </div>
        <ImageDisplay
          src={getImageUrl(currentImage)}
          alt={`MRI scan ${currentImage.id}`}
          loading={false}
        />
        <AnswerButtons
          onAnswer={submitAnswer}
          disabled={false}
        />
      </div>
    );
  }

  if (state.phase === 'explanation') {
    if (!currentImage) {
      return <ErrorState message="Error: No current image available" onReset={resetQuiz} />;
    }

    const lastAnswer = state.answers[state.answers.length - 1];
    if (!lastAnswer) {
      return <ErrorState message="Error: No answer record found" />;
    }

    const handleScrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isTablet) {
      return (
        <>
          <QuitButton onClick={resetQuiz} isFixed />
          <QuizHeader
            current={state.totalAnswered}
            total={sessionLength}
            score={state.score}
            isTablet
            isVisible={isProgressVisible}
            showIndicator={!isProgressVisible}
            onScrollToTop={handleScrollToTop}
          />
          <div className="w-full max-w-4xl mx-auto px-4">
            <ImageDisplay
              src={getImageUrl(currentImage)}
              alt={`MRI scan ${currentImage.id}`}
              loading={false}
              isTablet
              variant="explanation"
            />
            <Explanation
              type={currentImage.type}
              correct={lastAnswer.correct}
              userAnswer={lastAnswer.userAnswer}
              onContinue={nextQuestion}
              isTablet
            />
          </div>
        </>
      );
    }

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <QuizHeader
              current={state.totalAnswered}
              total={sessionLength}
              score={state.score}
            />
          </div>
          <QuitButton onClick={resetQuiz} />
        </div>
        <ImageDisplay
          src={getImageUrl(currentImage)}
          alt={`MRI scan ${currentImage.id}`}
          loading={false}
        />
        <Explanation
          type={currentImage.type}
          correct={lastAnswer.correct}
          userAnswer={lastAnswer.userAnswer}
          onContinue={nextQuestion}
        />
      </div>
    );
  }

  if (state.phase === 'results') {
    return (
      <ResultsScreen
        score={state.score}
        total={state.totalAnswered}
        answers={state.answers}
        images={metadata?.images ?? []}
        onReset={resetQuiz}
      />
    );
  }

  return <ErrorState message={`Unknown quiz phase: ${state.phase}`} onReset={resetQuiz} />;
}
