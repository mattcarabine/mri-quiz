import { useQuiz } from '../../hooks/useQuiz';
import { SessionSelector } from './SessionSelector';
import { ImageDisplay } from './ImageDisplay';
import { AnswerButtons } from './AnswerButtons';
import { ProgressBar } from './ProgressBar';
import { Explanation } from './Explanation';
import { ResultsScreen } from './ResultsScreen';

export function QuizContainer() {
  const { state, startQuiz, submitAnswer, nextQuestion, resetQuiz, currentImage } = useQuiz();

  // Loading state while metadata is being fetched
  if (!state.items.length && state.phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-lg">Loading quiz data...</p>
      </div>
    );
  }

  // Setup phase - show session selector
  if (state.phase === 'setup') {
    return <SessionSelector onSelect={startQuiz} />;
  }

  // Question phase - show image, answer buttons, progress
  if (state.phase === 'question') {
    if (!currentImage) {
      return (
        <div className="text-center text-red-400 p-8">
          <p className="text-xl">Error: No current image available</p>
          <button
            onClick={resetQuiz}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Return to Setup
          </button>
        </div>
      );
    }

    const imageUrl = `/images/${currentImage.type.toLowerCase()}/${currentImage.filename}`;
    const sessionLength = state.sessionLength === 'all' ? state.items.length : state.sessionLength;

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <ProgressBar
          current={state.totalAnswered + 1}
          total={sessionLength}
          score={state.score}
        />
        <ImageDisplay
          src={imageUrl}
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

  // Explanation phase - show image, explanation, progress
  if (state.phase === 'explanation') {
    if (!currentImage) {
      return (
        <div className="text-center text-red-400 p-8">
          <p className="text-xl">Error: No current image available</p>
          <button
            onClick={resetQuiz}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Return to Setup
          </button>
        </div>
      );
    }

    const lastAnswer = state.answers[state.answers.length - 1];
    if (!lastAnswer) {
      return (
        <div className="text-center text-red-400 p-8">
          <p className="text-xl">Error: No answer record found</p>
        </div>
      );
    }

    const imageUrl = `/images/${currentImage.type.toLowerCase()}/${currentImage.filename}`;
    const sessionLength = state.sessionLength === 'all' ? state.items.length : state.sessionLength;

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <ProgressBar
          current={state.totalAnswered}
          total={sessionLength}
          score={state.score}
        />
        <ImageDisplay
          src={imageUrl}
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

  // Results phase - show results screen
  if (state.phase === 'results') {
    return (
      <ResultsScreen
        score={state.score}
        total={state.totalAnswered}
        answers={state.answers}
        onReset={resetQuiz}
      />
    );
  }

  // Fallback for unknown phase
  return (
    <div className="text-center text-red-400 p-8">
      <p className="text-xl">Unknown quiz phase: {state.phase}</p>
      <button
        onClick={resetQuiz}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Return to Setup
      </button>
    </div>
  );
}
