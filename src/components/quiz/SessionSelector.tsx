import type { SessionLength } from '../../types/quiz';

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
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-gray-100">
          T1 vs T2 MRI Quiz
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Learn to differentiate between T1-weighted and T2-weighted MRI images.
          Practice identifying key characteristics like CSF brightness, tissue contrast, and anatomical details.
        </p>
      </div>

      {/* Key Learning Points */}
      <div className="p-6 rounded-lg bg-gray-800 border border-blue-500/30">
        <h2 className="text-lg font-semibold text-blue-400 mb-3">Quick Reference:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-300">T1-Weighted:</h3>
            <ul className="space-y-1 text-gray-300">
              <li>• CSF appears DARK</li>
              <li>• Fat appears BRIGHT</li>
              <li>• Best for anatomy</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-purple-300">T2-Weighted:</h3>
            <ul className="space-y-1 text-gray-300">
              <li>• CSF appears BRIGHT</li>
              <li>• Water/fluid BRIGHT</li>
              <li>• Best for pathology</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Session Length Options */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-100 mb-4 text-center">
          Choose Session Length
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessionOptions.map((option) => (
            <button
              key={option.title}
              onClick={() => onSelect(option.length)}
              className="p-6 rounded-lg bg-gray-800 hover:bg-gray-750 border-2 border-gray-700
                         hover:border-blue-500 transition-all text-left group
                         focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{option.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-gray-400 mt-1">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>Use keyboard shortcuts: Press 1 for T1, Press 2 for T2</p>
        <p>Press Enter to continue after explanations</p>
      </div>
    </div>
  );
}
