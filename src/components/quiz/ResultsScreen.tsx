import { useState } from 'react';
import type { AnswerRecord, QuizImage } from '../../types/quiz';
import { groupAnswersByImage, type AttemptGroup } from '../../lib/groupAnswers';

interface ResultsScreenProps {
  score: number;
  total: number;
  answers: AnswerRecord[];
  images: QuizImage[];
  onReset: () => void;
}

interface StatusBadgeProps {
  group: AttemptGroup;
}

interface AccordionItemProps {
  group: AttemptGroup;
  isExpanded: boolean;
  onToggle: () => void;
}

function StatusBadge({ group }: StatusBadgeProps) {
  if (group.status === 'eventually-correct') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/60 text-yellow-300 border border-yellow-600/50">
        <span className="w-2 h-2 rounded-full bg-yellow-400" aria-hidden="true"></span>
        Recovered
      </span>
    );
  }

  const label =
    group.totalCount > 1
      ? `Failed ${group.incorrectCount}x`
      : 'Incorrect';

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-300 border border-red-600/50">
      <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true"></span>
      {label}
    </span>
  );
}

function AccordionItem({ group, isExpanded, onToggle }: AccordionItemProps) {
  const imageUrl = group.image
    ? `/images/${group.image.type.toLowerCase()}/${group.image.filename}`
    : null;

  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 overflow-hidden shadow-surface">
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-300 text-sm font-medium truncate">{group.imageId}</span>
          <StatusBadge group={group} />
        </div>
        <span className="text-gray-500 text-xs shrink-0 ml-2">
          {group.totalCount} {group.totalCount === 1 ? 'attempt' : 'attempts'}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-700/50 p-4 space-y-4 bg-slate-950/30">
          {imageUrl && (
            <div className="flex items-center justify-center bg-slate-950 rounded-lg p-4 border border-slate-700/50 shadow-surface">
              <img
                src={imageUrl}
                alt={`MRI scan ${group.imageId}`}
                className="max-w-full max-h-[300px] object-contain rounded shadow-elevated"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            {group.attempts.map((attempt, idx) => (
              <div
                key={`${group.imageId}-${idx}`}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 rounded text-sm border-l-4 ${
                  attempt.correct
                    ? 'border-l-green-500 bg-green-950/20'
                    : 'border-l-red-500 bg-red-950/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-mono text-xs">
                    #{idx + 1}
                  </span>
                  <span className={attempt.correct ? 'text-green-400' : 'text-red-400'}>
                    {attempt.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs ml-6 sm:ml-0 mt-1 sm:mt-0">
                  <span className="text-gray-400">
                    Answered: <span className={attempt.correct ? 'text-green-400' : 'text-red-400'}>{attempt.userAnswer}</span>
                  </span>
                  {!attempt.correct && (
                    <span className="text-gray-400">
                      Correct: <span className="text-green-400">{attempt.correctAnswer}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatAccuracy(correct: number, total: number): string {
  if (total === 0) return 'No questions';
  return `${((correct / total) * 100).toFixed(0)}% accuracy`;
}

function getFeedback(percentage: number): { message: string; color: string } {
  if (percentage >= 90) {
    return {
      message: 'Outstanding! You have excellent mastery of T1/T2 differentiation.',
      color: 'text-green-400',
    };
  }
  if (percentage >= 75) {
    return {
      message: 'Great job! You have a solid understanding of MRI weighting.',
      color: 'text-blue-400',
    };
  }
  if (percentage >= 60) {
    return {
      message: 'Good progress! Keep practicing to strengthen your recognition skills.',
      color: 'text-yellow-400',
    };
  }
  return {
    message: 'Keep learning! Review the key differentiators and try again.',
    color: 'text-orange-400',
  };
}

export function ResultsScreen({ score, total, answers, images, onReset }: ResultsScreenProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const percentage = total > 0 ? (score / total) * 100 : 0;
  const percentageDisplay = percentage.toFixed(1);
  const feedback = getFeedback(percentage);

  // Calculate T1 vs T2 breakdown
  const t1Questions = answers.filter((a) => a.correctAnswer === 'T1');
  const t2Questions = answers.filter((a) => a.correctAnswer === 'T2');
  const t1Correct = t1Questions.filter((a) => a.correct).length;
  const t2Correct = t2Questions.filter((a) => a.correct).length;

  // Group and filter to images with at least one incorrect answer
  const allGroups = groupAnswersByImage(answers, images);
  const reviewGroups = allGroups.filter((g) => g.incorrectCount > 0);

  const toggleExpanded = (imageId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      {/* Final Score */}
      <div className="text-center p-6 sm:p-8 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-blue-500/50 shadow-elevated animate-slide-in">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100 mb-2">Quiz Complete!</h2>
        <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-score my-4">
          {score}/{total}
        </div>
        <div className="text-2xl sm:text-3xl text-gray-300 mb-4">{percentageDisplay}%</div>
        <p className={`text-base sm:text-lg md:text-xl ${feedback.color}`}>{feedback.message}</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-950/30 to-cyan-950/30 border border-blue-700/30 shadow-surface">
          <h3 className="text-base sm:text-lg font-semibold text-gradient-t1 mb-3">T1-Weighted Images</h3>
          <div className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
            {t1Correct}/{t1Questions.length}
          </div>
          <p className="text-gray-400 text-sm mb-3">
            {formatAccuracy(t1Correct, t1Questions.length)}
          </p>
          {/* Visual bar chart */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-t1 h-full transition-all duration-500 rounded-full"
              style={{ width: `${t1Questions.length > 0 ? (t1Correct / t1Questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-950/30 to-pink-950/30 border border-purple-700/30 shadow-surface">
          <h3 className="text-base sm:text-lg font-semibold text-gradient-t2 mb-3">T2-Weighted Images</h3>
          <div className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
            {t2Correct}/{t2Questions.length}
          </div>
          <p className="text-gray-400 text-sm mb-3">
            {formatAccuracy(t2Correct, t2Questions.length)}
          </p>
          {/* Visual bar chart */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-t2 h-full transition-all duration-500 rounded-full"
              style={{ width: `${t2Questions.length > 0 ? (t2Correct / t2Questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions to Review - Grouped Accordion */}
      {reviewGroups.length > 0 && (
        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-elevated animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-4">
            Questions to Review ({reviewGroups.length} {reviewGroups.length === 1 ? 'image' : 'images'})
          </h3>
          <div className="space-y-3">
            {reviewGroups.map((group) => (
              <AccordionItem
                key={group.imageId}
                group={group}
                isExpanded={expandedIds.has(group.imageId)}
                onToggle={() => toggleExpanded(group.imageId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Try Again Button */}
      <button
        onClick={onReset}
        className="w-full py-4 px-8 text-lg sm:text-xl font-semibold rounded-xl
                   bg-gradient-to-br from-blue-600 to-cyan-600
                   hover:from-blue-500 hover:to-cyan-500
                   hover:ring-2 hover:ring-blue-400/50 hover:shadow-lg hover:shadow-blue-500/25
                   text-white shadow-surface
                   focus:outline-none focus:ring-4 focus:ring-blue-500/50
                   transition-all min-h-[56px] active:scale-[0.98]
                   animate-slide-in"
        style={{ animationDelay: '0.3s' }}
      >
        Try Again
      </button>
    </div>
  );
}
