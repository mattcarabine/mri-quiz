import type { SessionLength } from '../../types/quiz';
import { ComparisonTable } from '../ui/ComparisonTable';
import { quickReferenceData } from '../../lib/quickReference';

interface SessionSelectorProps {
  onSelect: (length: SessionLength) => void;
}

const sessionOptions = [
  {
    length: 20 as SessionLength,
    title: 'Quick',
    description: '20 questions - Perfect for a quick practice session',
    icon: '⚡',
  },
  {
    length: 50 as SessionLength,
    title: 'Standard',
    description: '50 questions - Balanced practice session',
    icon: '📚',
  },
  {
    length: 100 as SessionLength,
    title: 'Extended',
    description: '100 questions - Comprehensive practice',
    icon: '🎯',
  },
  {
    length: 'all' as SessionLength,
    title: 'Full',
    description: 'All questions - Complete review of all images',
    icon: '🏆',
  },
];

export function SessionSelector({ onSelect }: SessionSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-t1 animate-slide-in">
          T1 vs T2 MRI Quiz
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto animate-slide-in" style={{ animationDelay: '0.1s' }}>
          Learn to differentiate between T1-weighted and T2-weighted MRI images.
          Practice identifying key characteristics like CSF brightness, tissue contrast, and anatomical details.
        </p>
      </div>

      {/* Key Learning Points - Comparison Table */}
      <div className="mx-4 sm:mx-0 animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-base sm:text-lg font-semibold text-blue-400 mb-4 text-center">Quick Reference</h2>
        <ComparisonTable data={quickReferenceData} />
      </div>

      {/* Session Length Options */}
      <div className="px-4 sm:px-0 animate-slide-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-6 text-center">
          Choose Session Length
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessionOptions.map((option, index) => (
            <button
              key={option.title}
              onClick={() => onSelect(option.length)}
              className="p-6 sm:p-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800
                         border-2 border-slate-700/50 hover:border-blue-500/50
                         shadow-surface hover:shadow-interactive hover-lift
                         transition-all text-left group
                         focus:outline-none focus:ring-4 focus:ring-blue-500/50
                         min-h-[88px] active:scale-[0.98]"
              style={{ animationDelay: `${0.4 + index * 0.05}s` }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="text-4xl sm:text-5xl transition-transform group-hover:scale-110">
                  {option.icon}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-100 group-hover:text-gradient-t1 transition-all">
                    {option.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 mt-1">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs sm:text-sm text-gray-500 space-y-1 px-4">
        <p>Use keyboard shortcuts: Press 1 for T1, Press 2 for T2</p>
        <p>Press Enter to continue after explanations</p>
      </div>
    </div>
  );
}
