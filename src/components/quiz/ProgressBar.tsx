interface ProgressBarProps {
  current: number;
  total: number;
  score: number;
}

export function ProgressBar({ current, total, score }: ProgressBarProps) {
  const progressPercentage = (current / total) * 100;
  const accuracy = current > 0 ? ((score / current) * 100).toFixed(0) : '0';

  return (
    <div className="w-full space-y-3">
      {/* Text Information */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-200 font-semibold tracking-wide">
          Question {current} of {total}
        </span>
        <span className="text-gray-200 font-semibold tracking-wide">
          Score: <span className="text-gradient-score">{score}/{current}</span> ({accuracy}%)
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner border border-slate-700/50">
        <div
          className="h-full transition-all duration-300 ease-out rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg relative"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
