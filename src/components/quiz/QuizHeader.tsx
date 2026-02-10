import { ProgressBar } from './ProgressBar';

interface QuizHeaderProps {
  current: number;
  total: number;
  score: number;
  isTablet?: boolean;
  isVisible?: boolean;
  showIndicator?: boolean;
  onScrollToTop?: () => void;
}

function ScrollIndicator({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-45
                 flex items-center justify-center
                 w-16 h-8 rounded-b-lg
                 bg-gradient-to-b from-blue-600/80 to-purple-600/80
                 backdrop-blur-sm shadow-elevated
                 hover:from-blue-500/90 hover:to-purple-500/90
                 transition-all animate-indicator-pulse
                 cursor-pointer group"
      aria-label="Scroll to top to show progress"
      title="Tap to show progress"
    >
      <svg
        className="w-5 h-5 text-white group-hover:text-white/90 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function QuizHeader({
  current,
  total,
  score,
  isTablet = false,
  isVisible = true,
  showIndicator = false,
  onScrollToTop,
}: QuizHeaderProps) {
  if (isTablet) {
    return (
      <>
        {showIndicator && onScrollToTop && <ScrollIndicator onClick={onScrollToTop} />}
        <div
          className={`header-collapse ${!isVisible ? 'hidden' : ''}`}
          style={{
            position: isTablet ? 'sticky' : 'static',
            top: 0,
            zIndex: 40,
            backgroundColor: 'rgb(3, 7, 18)',
            paddingTop: '1rem',
            paddingBottom: '1rem',
          }}
        >
          <div className="w-full max-w-4xl mx-auto px-4">
            <ProgressBar current={current} total={total} score={score} />
          </div>
        </div>
      </>
    );
  }

  // Default non-tablet layout
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <ProgressBar current={current} total={total} score={score} />
      </div>
    </div>
  );
}
