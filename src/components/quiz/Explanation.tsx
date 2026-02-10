import { getExplanation } from '../../lib/explanations';

interface ExplanationProps {
  type: 'T1' | 'T2';
  correct: boolean;
  userAnswer: 'T1' | 'T2';
  onContinue: () => void;
}

export function Explanation({ type, correct, userAnswer, onContinue }: ExplanationProps) {
  const explanation = correct ? null : getExplanation(type, correct);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Result Header */}
      <div className="flex items-center justify-center gap-3 p-6 rounded-lg bg-gray-800">
        {correct ? (
          <>
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-3xl font-bold text-green-500">Correct!</span>
          </>
        ) : (
          <>
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-red-500">Incorrect</span>
              <span className="text-gray-400 text-sm">You answered: {userAnswer}</span>
            </div>
          </>
        )}
      </div>

      {!correct && explanation && (
        <>
          {/* Feedback Message */}
          <div className="p-6 rounded-lg bg-gray-800 border-l-4 border-blue-500">
            <p className="text-lg text-gray-100">{explanation.feedbackMessage}</p>
          </div>

          {/* Educational Content */}
          <div className="p-6 rounded-lg bg-gray-800 space-y-4">
            <h3 className="text-2xl font-bold text-blue-400">{explanation.title}</h3>

            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Characteristics:</h4>
              <ul className="space-y-2">
                {explanation.characteristics.map((char, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-200">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded bg-yellow-900/30 border border-yellow-700/50">
              <h4 className="text-sm font-semibold text-yellow-400 uppercase mb-1">Memory Aid:</h4>
              <p className="text-yellow-100">{explanation.memoryAid}</p>
            </div>

            <div className="p-4 rounded bg-green-900/30 border border-green-700/50">
              <h4 className="text-sm font-semibold text-green-400 uppercase mb-1">Key Differentiator:</h4>
              <p className="text-green-100">{explanation.keyDifferentiator}</p>
            </div>
          </div>
        </>
      )}

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full py-4 px-8 text-xl font-semibold rounded-lg
                   bg-green-600 hover:bg-green-700 text-white
                   focus:outline-none focus:ring-4 focus:ring-green-500/50
                   transition-all"
      >
        Continue <span className="text-sm font-normal opacity-75">(Press Enter)</span>
      </button>
    </div>
  );
}
