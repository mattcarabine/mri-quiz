import { describe, it, expect } from 'vitest';
import { groupAnswersByImage } from '../groupAnswers';
import type { AnswerRecord, QuizImage } from '../../types/quiz';

function makeAnswer(
  imageId: string,
  correct: boolean,
  userAnswer: 'T1' | 'T2' = 'T1',
  correctAnswer: 'T1' | 'T2' = 'T2',
): AnswerRecord {
  return { imageId, correct, userAnswer, correctAnswer, timestamp: Date.now() };
}

function makeImage(id: string, type: 'T1' | 'T2' = 'T1'): QuizImage {
  return { id, filename: `${id}.jpg`, type, subject: 'Brain' };
}

describe('groupAnswersByImage', () => {
  it('returns empty array for empty answers', () => {
    expect(groupAnswersByImage([], [])).toEqual([]);
  });

  it('single incorrect attempt is repeated-failure', () => {
    const answers = [makeAnswer('img-1', false)];
    const images = [makeImage('img-1')];
    const groups = groupAnswersByImage(answers, images);

    expect(groups).toHaveLength(1);
    expect(groups[0].status).toBe('repeated-failure');
    expect(groups[0].incorrectCount).toBe(1);
    expect(groups[0].totalCount).toBe(1);
  });

  it('multiple attempts all incorrect is repeated-failure with correct count', () => {
    const answers = [
      makeAnswer('img-1', false),
      makeAnswer('img-1', false),
      makeAnswer('img-1', false),
    ];
    const images = [makeImage('img-1')];
    const groups = groupAnswersByImage(answers, images);

    expect(groups).toHaveLength(1);
    expect(groups[0].status).toBe('repeated-failure');
    expect(groups[0].incorrectCount).toBe(3);
    expect(groups[0].totalCount).toBe(3);
  });

  it('failed then succeeded is eventually-correct', () => {
    const answers = [
      makeAnswer('img-1', false),
      makeAnswer('img-1', false),
      makeAnswer('img-1', true, 'T2', 'T2'),
    ];
    const images = [makeImage('img-1')];
    const groups = groupAnswersByImage(answers, images);

    expect(groups).toHaveLength(1);
    expect(groups[0].status).toBe('eventually-correct');
    expect(groups[0].incorrectCount).toBe(2);
    expect(groups[0].totalCount).toBe(3);
  });

  it('maintains first-seen order across multiple images', () => {
    const answers = [
      makeAnswer('img-a', false),
      makeAnswer('img-b', false),
      makeAnswer('img-a', true, 'T1', 'T1'),
      makeAnswer('img-c', false),
      makeAnswer('img-b', false),
    ];
    const images = [makeImage('img-a'), makeImage('img-b'), makeImage('img-c')];
    const groups = groupAnswersByImage(answers, images);

    expect(groups.map((g) => g.imageId)).toEqual(['img-a', 'img-b', 'img-c']);
  });

  it('sets image to null when not found in metadata', () => {
    const answers = [makeAnswer('img-missing', false)];
    const groups = groupAnswersByImage(answers, []);

    expect(groups).toHaveLength(1);
    expect(groups[0].image).toBeNull();
    expect(groups[0].imageId).toBe('img-missing');
  });

  it('groups multiple different images correctly', () => {
    const answers = [
      makeAnswer('img-1', false),
      makeAnswer('img-2', true, 'T2', 'T2'),
      makeAnswer('img-1', true, 'T2', 'T2'),
    ];
    const images = [makeImage('img-1'), makeImage('img-2', 'T2')];
    const groups = groupAnswersByImage(answers, images);

    expect(groups).toHaveLength(2);

    const group1 = groups.find((g) => g.imageId === 'img-1')!;
    expect(group1.status).toBe('eventually-correct');
    expect(group1.totalCount).toBe(2);
    expect(group1.image?.type).toBe('T1');

    const group2 = groups.find((g) => g.imageId === 'img-2')!;
    expect(group2.status).toBe('repeated-failure');
    expect(group2.incorrectCount).toBe(0);
    expect(group2.totalCount).toBe(1);
  });
});
