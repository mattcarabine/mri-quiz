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
        <span className="text-gray-300 font-medium">
          Question {current} of {total}
        </span>
        <span className="text-gray-300 font-medium">
          Score: {score}/{current} ({accuracy}%)
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
