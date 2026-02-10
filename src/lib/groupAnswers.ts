import type { AnswerRecord, QuizImage } from '../types/quiz';

export type ImageAttemptStatus = 'eventually-correct' | 'repeated-failure';

export interface AttemptGroup {
  imageId: string;
  image: QuizImage | null;
  attempts: AnswerRecord[];
  status: ImageAttemptStatus;
  incorrectCount: number;
  totalCount: number;
}

export function groupAnswersByImage(
  answers: AnswerRecord[],
  images: QuizImage[],
): AttemptGroup[] {
  const imageMap = new Map<string, QuizImage>();
  for (const img of images) {
    imageMap.set(img.id, img);
  }

  const groupMap = new Map<string, AnswerRecord[]>();
  const insertionOrder: string[] = [];

  for (const answer of answers) {
    const existing = groupMap.get(answer.imageId);
    if (existing) {
      existing.push(answer);
    } else {
      groupMap.set(answer.imageId, [answer]);
      insertionOrder.push(answer.imageId);
    }
  }

  return insertionOrder.map((imageId) => {
    const attempts = groupMap.get(imageId)!;
    const incorrectCount = attempts.filter((a) => !a.correct).length;
    const hasCorrect = attempts.some((a) => a.correct);

    const status: ImageAttemptStatus =
      incorrectCount > 0 && hasCorrect ? 'eventually-correct' : 'repeated-failure';

    return {
      imageId,
      image: imageMap.get(imageId) ?? null,
      attempts,
      status,
      incorrectCount,
      totalCount: attempts.length,
    };
  });
}
