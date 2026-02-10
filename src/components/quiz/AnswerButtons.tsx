interface AnswerButtonsProps {
  onAnswer: (answer: 'T1' | 'T2') => void;
  disabled: boolean;
  isFixed?: boolean;
}

export function AnswerButtons({ onAnswer, disabled, isFixed = false }: AnswerButtonsProps) {
  const containerClasses = isFixed
    ? 'fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent backdrop-blur-sm pt-6 pb-safe animate-slide-up'
    : '';

  const innerClasses = 'flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto';

  const content = (
    <div className={innerClasses}>
      <button
        onClick={() => onAnswer('T1')}
        disabled={disabled}
        className="flex-1 py-6 px-8 text-xl font-semibold rounded-xl transition-all
                   bg-gradient-to-br from-blue-600 to-cyan-600
                   hover:from-blue-500 hover:to-cyan-500
                   hover:ring-2 hover:ring-blue-400/50 hover:shadow-lg hover:shadow-blue-500/25
                   disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:from-gray-600 disabled:to-gray-600
                   focus:outline-none focus:ring-4 focus:ring-blue-500/50
                   min-h-[80px] flex flex-col items-center justify-center gap-2 text-white
                   active:scale-[0.98] shadow-surface"
      >
        <span>T1-Weighted</span>
        <span className="text-sm font-normal opacity-75">Press 1</span>
      </button>

      <button
        onClick={() => onAnswer('T2')}
        disabled={disabled}
        className="flex-1 py-6 px-8 text-xl font-semibold rounded-xl transition-all
                   bg-gradient-to-br from-purple-600 to-pink-600
                   hover:from-purple-500 hover:to-pink-500
                   hover:ring-2 hover:ring-purple-400/50 hover:shadow-lg hover:shadow-purple-500/25
                   disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:from-gray-600 disabled:to-gray-600
                   focus:outline-none focus:ring-4 focus:ring-purple-500/50
                   min-h-[80px] flex flex-col items-center justify-center gap-2 text-white
                   active:scale-[0.98] shadow-surface"
      >
        <span>T2-Weighted</span>
        <span className="text-sm font-normal opacity-75">Press 2</span>
      </button>
    </div>
  );

  if (isFixed) {
    return (
      <div className={containerClasses}>
        <div className="px-4 pb-6">{content}</div>
      </div>
    );
  }

  return content;
}
