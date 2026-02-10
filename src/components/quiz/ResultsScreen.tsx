import type { AnswerRecord } from '../../types/quiz';

interface ResultsScreenProps {
  score: number;
  total: number;
  answers: AnswerRecord[];
  onReset: () => void;
}

export function ResultsScreen({ score, total, answers, onReset }: ResultsScreenProps) {
  const percentage = ((score / total) * 100).toFixed(1);
  const percentageNum = parseFloat(percentage);

  // Calculate T1 vs T2 breakdown
  const t1Questions = answers.filter(a => a.correctAnswer === 'T1');
  const t2Questions = answers.filter(a => a.correctAnswer === 'T2');
  const t1Correct = t1Questions.filter(a => a.correct).length;
  const t2Correct = t2Questions.filter(a => a.correct).length;

  // Get missed questions
  const missedQuestions = answers.filter(a => !a.correct);

  // Feedback based on score
  let feedbackMessage = '';
  let feedbackColor = '';

  if (percentageNum >= 90) {
    feedbackMessage = 'Outstanding! You have excellent mastery of T1/T2 differentiation.';
    feedbackColor = 'text-green-400';
  } else if (percentageNum >= 75) {
    feedbackMessage = 'Great job! You have a solid understanding of MRI weighting.';
    feedbackColor = 'text-blue-400';
  } else if (percentageNum >= 60) {
    feedbackMessage = 'Good progress! Keep practicing to strengthen your recognition skills.';
    feedbackColor = 'text-yellow-400';
  } else {
    feedbackMessage = 'Keep learning! Review the key differentiators and try again.';
    feedbackColor = 'text-orange-400';
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      {/* Final Score */}
      <div className="text-center p-6 sm:p-8 rounded-lg bg-gray-800 border-2 border-blue-500">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100 mb-2">Quiz Complete!</h2>
        <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-400 my-4">
          {score}/{total}
        </div>
        <div className="text-2xl sm:text-3xl text-gray-300 mb-4">{percentage}%</div>
        <p className={`text-base sm:text-lg md:text-xl ${feedbackColor}`}>{feedbackMessage}</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 sm:p-6 rounded-lg bg-gray-800">
          <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-3">T1-Weighted Images</h3>
          <div className="text-2xl sm:text-3xl font-bold text-gray-100">
            {t1Correct}/{t1Questions.length}
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {t1Questions.length > 0
              ? `${((t1Correct / t1Questions.length) * 100).toFixed(0)}% accuracy`
              : 'No T1 questions'}
          </p>
        </div>

        <div className="p-4 sm:p-6 rounded-lg bg-gray-800">
          <h3 className="text-base sm:text-lg font-semibold text-purple-400 mb-3">T2-Weighted Images</h3>
          <div className="text-2xl sm:text-3xl font-bold text-gray-100">
            {t2Correct}/{t2Questions.length}
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {t2Questions.length > 0
              ? `${((t2Correct / t2Questions.length) * 100).toFixed(0)}% accuracy`
              : 'No T2 questions'}
          </p>
        </div>
      </div>

      {/* Missed Questions */}
      {missedQuestions.length > 0 && (
        <div className="p-4 sm:p-6 rounded-lg bg-gray-800">
          <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-4">
            Questions to Review ({missedQuestions.length})
          </h3>
          <div className="space-y-3">
            {missedQuestions.map((answer, idx) => (
              <div
                key={answer.imageId}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded bg-gray-900 border border-gray-700 gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-mono text-sm">#{idx + 1}</span>
                  <span className="text-gray-300 text-sm">Image ID: {answer.imageId}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm ml-8 sm:ml-0">
                  <span className="text-red-400">Your answer: {answer.userAnswer}</span>
                  <span className="text-green-400">Correct: {answer.correctAnswer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Try Again Button */}
      <button
        onClick={onReset}
        className="w-full py-4 px-8 text-lg sm:text-xl font-semibold rounded-lg
                   bg-blue-600 hover:bg-blue-700 text-white
                   focus:outline-none focus:ring-4 focus:ring-blue-500/50
                   transition-all min-h-[56px] active:scale-98"
      >
        Try Again
      </button>
    </div>
  );
}
