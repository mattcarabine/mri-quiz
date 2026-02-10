import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizContainer } from '../QuizContainer';
import type { QuizImage } from '../../../types/quiz';

const mockImages: QuizImage[] = [
  { id: 'img1', filename: 'img1.jpg', type: 'T1', subject: 'Subject1' },
  { id: 'img2', filename: 'img2.jpg', type: 'T2', subject: 'Subject2' },
  { id: 'img3', filename: 'img3.jpg', type: 'T1', subject: 'Subject3' },
  { id: 'img4', filename: 'img4.jpg', type: 'T2', subject: 'Subject4' },
  { id: 'img5', filename: 'img5.jpg', type: 'T1', subject: 'Subject5' },
];

describe('QuizContainer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        images: mockImages,
        stats: { total: 5, t1Count: 3, t2Count: 2 },
      }),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  async function startQuiz() {
    render(<QuizContainer />);

    // Wait for metadata to load and click the Quick (20 questions) session button
    const button = await screen.findByRole('button', { name: /20 questions/i });
    await userEvent.click(button);

    // Should now be in question phase
    await waitFor(() => {
      expect(screen.getByText(/question 1 of/i)).toBeInTheDocument();
    });
  }

  it('shows an end quiz button during question phase', async () => {
    await startQuiz();

    expect(screen.getByRole('button', { name: /end quiz/i })).toBeInTheDocument();
  });

  it('returns to setup when end quiz is clicked during question phase', async () => {
    await startQuiz();

    const endButton = screen.getByRole('button', { name: /end quiz/i });
    await userEvent.click(endButton);

    // Should return to session selector (setup phase)
    await waitFor(() => {
      expect(screen.getByText(/T1 vs T2 MRI Quiz/i)).toBeInTheDocument();
    });
  });

  it('shows an end quiz button during explanation phase', async () => {
    await startQuiz();

    // Answer a question to get to explanation phase
    const t1Button = screen.getByRole('button', { name: /T1-Weighted/i });
    await userEvent.click(t1Button);

    // Should now be in explanation phase
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /end quiz/i })).toBeInTheDocument();
  });

  it('returns to setup when end quiz is clicked during explanation phase', async () => {
    await startQuiz();

    // Answer a question to get to explanation phase
    const t1Button = screen.getByRole('button', { name: /T1-Weighted/i });
    await userEvent.click(t1Button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    const endButton = screen.getByRole('button', { name: /end quiz/i });
    await userEvent.click(endButton);

    // Should return to session selector
    await waitFor(() => {
      expect(screen.getByText(/T1 vs T2 MRI Quiz/i)).toBeInTheDocument();
    });
  });
});
