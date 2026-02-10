import { useQuiz } from '../../hooks/useQuiz';
import { useImagePreloader } from '../../hooks/useImagePreloader';
import { SessionSelector } from './SessionSelector';
import { ImageDisplay } from './ImageDisplay';
import { AnswerButtons } from './AnswerButtons';
import { ProgressBar } from './ProgressBar';
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

function QuitButton({ onClick }: { onClick: () => void }) {
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

function QuizHeader({ current, total, score, onQuit }: {
  current: number;
  total: number;
  score: number;
  onQuit: () => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <ProgressBar current={current} total={total} score={score} />
      </div>
      <QuitButton onClick={onQuit} />
    </div>
  );
}

export function QuizContainer() {
  const { state, startQuiz, submitAnswer, nextQuestion, resetQuiz, currentImage, metadata } = useQuiz();

  // Preload next 2-3 images for smooth UX
  useImagePreloader(state.items, state.currentIndex);

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

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <QuizHeader
          current={state.totalAnswered + 1}
          total={sessionLength}
          score={state.score}
          onQuit={resetQuiz}
        />
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

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <QuizHeader
          current={state.totalAnswered}
          total={sessionLength}
          score={state.score}
          onQuit={resetQuiz}
        />
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
