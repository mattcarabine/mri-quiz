import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultsScreen } from '../ResultsScreen';
import type { AnswerRecord, QuizImage } from '../../../types/quiz';

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

const defaultProps = {
  score: 8,
  total: 10,
  onReset: vi.fn(),
  images: [] as QuizImage[],
  answers: [] as AnswerRecord[],
};

describe('ResultsScreen', () => {
  it('renders score and percentage', () => {
    render(<ResultsScreen {...defaultProps} score={7} total={10} answers={[]} />);
    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('70.0%')).toBeInTheDocument();
  });

  it('hides review section when all answers are correct', () => {
    const answers = [
      makeAnswer('img-1', true, 'T1', 'T1'),
      makeAnswer('img-2', true, 'T2', 'T2'),
    ];
    render(<ResultsScreen {...defaultProps} answers={answers} />);
    expect(screen.queryByText(/Questions to Review/)).not.toBeInTheDocument();
  });

  it('shows review section with grouped images', () => {
    const answers = [
      makeAnswer('img-1', false),
      makeAnswer('img-2', false),
      makeAnswer('img-1', true, 'T2', 'T2'),
    ];
    const images = [makeImage('img-1'), makeImage('img-2')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    expect(screen.getByText('Questions to Review (2 images)')).toBeInTheDocument();
  });

  it('shows singular "image" for single review group', () => {
    const answers = [makeAnswer('img-1', false)];
    const images = [makeImage('img-1')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    expect(screen.getByText('Questions to Review (1 image)')).toBeInTheDocument();
  });

  it('accordion starts collapsed and expands on click', async () => {
    const user = userEvent.setup();
    const answers = [makeAnswer('img-1', false)];
    const images = [makeImage('img-1')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    const button = screen.getByRole('button', { name: /img-1/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    // No image visible initially
    expect(screen.queryByAltText('MRI scan img-1')).not.toBeInTheDocument();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByAltText('MRI scan img-1')).toBeInTheDocument();
  });

  it('allows multiple accordions open simultaneously', async () => {
    const user = userEvent.setup();
    const answers = [makeAnswer('img-1', false), makeAnswer('img-2', false)];
    const images = [makeImage('img-1'), makeImage('img-2')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    const button1 = screen.getByRole('button', { name: /img-1/i });
    const button2 = screen.getByRole('button', { name: /img-2/i });

    await user.click(button1);
    await user.click(button2);

    expect(button1).toHaveAttribute('aria-expanded', 'true');
    expect(button2).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows "Recovered" badge for eventually-correct images', () => {
    const answers = [
      makeAnswer('img-1', false),
      makeAnswer('img-1', true, 'T2', 'T2'),
    ];
    const images = [makeImage('img-1')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });

  it('shows "Incorrect" badge for single failed attempt', () => {
    const answers = [makeAnswer('img-1', false)];
    const images = [makeImage('img-1')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  it('shows "Failed Nx" badge for multiple failed attempts', () => {
    const answers = [
      makeAnswer('img-1', false),
      makeAnswer('img-1', false),
      makeAnswer('img-1', false),
    ];
    const images = [makeImage('img-1')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    expect(screen.getByText('Failed 3x')).toBeInTheDocument();
  });

  it('constructs correct image URL from metadata', async () => {
    const user = userEvent.setup();
    const answers = [makeAnswer('img-1', false)];
    const images: QuizImage[] = [
      { id: 'img-1', filename: 'brain_scan.jpg', type: 'T2', subject: 'Brain' },
    ];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    await user.click(screen.getByRole('button', { name: /img-1/i }));
    const img = screen.getByAltText('MRI scan img-1') as HTMLImageElement;
    expect(img.src).toContain('/images/t2/brain_scan.jpg');
  });

  it('shows attempt count text', () => {
    const answers = [
      makeAnswer('img-1', false),
      makeAnswer('img-1', false),
    ];
    const images = [makeImage('img-1')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    expect(screen.getByText('2 attempts')).toBeInTheDocument();
  });

  it('shows singular "attempt" for single attempt', () => {
    const answers = [makeAnswer('img-1', false)];
    const images = [makeImage('img-1')];
    render(<ResultsScreen {...defaultProps} answers={answers} images={images} />);

    expect(screen.getByText('1 attempt')).toBeInTheDocument();
  });
});
