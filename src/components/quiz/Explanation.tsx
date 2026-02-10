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
      <div className={`flex items-center justify-center gap-3 p-6 rounded-xl shadow-elevated animate-slide-in
                      ${correct ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-600/30' : 'bg-gradient-to-br from-red-900/50 to-rose-900/50 border border-red-600/30'}`}>
        {correct ? (
          <>
            <svg className="w-12 h-12 text-green-400 animate-pulse-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-3xl font-bold text-green-400">Correct!</span>
          </>
        ) : (
          <>
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-red-400">Incorrect</span>
              <span className="text-gray-300 text-sm">You answered: {userAnswer}</span>
            </div>
          </>
        )}
      </div>

      {!correct && explanation && (
        <>
          {/* Feedback Message */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border-l-4 border-blue-500 shadow-surface animate-slide-in"
               style={{ animationDelay: '0.1s' }}>
            <p className="text-lg text-gray-100">{explanation.feedbackMessage}</p>
          </div>

          {/* Educational Content */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-elevated space-y-5 animate-slide-in"
               style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-bold text-gradient-t1">{explanation.title}</h3>

            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Characteristics:</h4>
              <ul className="space-y-2.5">
                {explanation.characteristics.map((char, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-200">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-600/30 shadow-surface">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-1.5">Memory Aid:</h4>
                  <p className="text-yellow-50">{explanation.memoryAid}</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-600/30 shadow-surface">
              <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-2">Key Differentiator:</h4>
              <p className="text-green-50">{explanation.keyDifferentiator}</p>
            </div>
          </div>
        </>
      )}

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full py-4 px-8 text-xl font-semibold rounded-xl
                   bg-gradient-to-br from-green-600 to-emerald-600
                   hover:from-green-500 hover:to-emerald-500
                   hover:ring-2 hover:ring-green-400/50 hover:shadow-lg hover:shadow-green-500/25
                   text-white shadow-surface
                   focus:outline-none focus:ring-4 focus:ring-green-500/50
                   transition-all active:scale-[0.98]
                   animate-slide-in"
        style={{ animationDelay: correct ? '0.1s' : '0.3s' }}
      >
        Continue <span className="text-sm font-normal opacity-75">(Press Enter)</span>
      </button>
    </div>
  );
}
