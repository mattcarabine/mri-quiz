interface AnswerButtonsProps {
  onAnswer: (answer: 'T1' | 'T2') => void;
  disabled: boolean;
}

export function AnswerButtons({ onAnswer, disabled }: AnswerButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
      <button
        onClick={() => onAnswer('T1')}
        disabled={disabled}
        className="flex-1 py-6 px-8 text-xl font-semibold rounded-lg transition-all
                   bg-blue-600 hover:bg-blue-700 text-white
                   disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50
                   focus:outline-none focus:ring-4 focus:ring-blue-500/50
                   min-h-[80px] flex flex-col items-center justify-center gap-2"
      >
        <span>T1-Weighted</span>
        <span className="text-sm font-normal opacity-75">Press 1</span>
      </button>

      <button
        onClick={() => onAnswer('T2')}
        disabled={disabled}
        className="flex-1 py-6 px-8 text-xl font-semibold rounded-lg transition-all
                   bg-purple-600 hover:bg-purple-700 text-white
                   disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50
                   focus:outline-none focus:ring-4 focus:ring-purple-500/50
                   min-h-[80px] flex flex-col items-center justify-center gap-2"
      >
        <span>T2-Weighted</span>
        <span className="text-sm font-normal opacity-75">Press 2</span>
      </button>
    </div>
  );
}
