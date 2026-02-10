export interface ExplanationContent {
  title: string;
  characteristics: string[];
  memoryAid: string;
  keyDifferentiator: string;
  feedbackMessage: string;
}

/**
 * Get educational explanation content for T1 or T2 images.
 * Includes memory aids and key differentiators.
 */
export function getExplanation(type: 'T1' | 'T2', correct: boolean): ExplanationContent {
  if (type === 'T1') {
    return {
      title: 'T1-Weighted Image',
      characteristics: [
        'CSF (cerebrospinal fluid) appears DARK',
        'Fat appears BRIGHT',
        'White matter appears brighter than gray matter',
        'Good for anatomical detail',
      ],
      memoryAid: 'T1 = ONE anatomy scan - fat bright, water dark',
      keyDifferentiator: 'Look at the ventricles (CSF spaces) - DARK in T1, BRIGHT in T2',
      feedbackMessage: correct
        ? 'Correct! T1 images show dark CSF and bright fat, excellent for anatomy.'
        : 'This is a T1 image. Remember: T1 has DARK ventricles (CSF), while T2 has BRIGHT ventricles.',
    };
  } else {
    return {
      title: 'T2-Weighted Image',
      characteristics: [
        'CSF (cerebrospinal fluid) appears BRIGHT',
        'Fat appears less bright than in T1',
        'Gray matter appears brighter than white matter',
        'Good for detecting pathology and edema',
      ],
      memoryAid: 'T2 = TWO = H2O - water and fluids are bright',
      keyDifferentiator: 'Look at the ventricles (CSF spaces) - DARK in T1, BRIGHT in T2',
      feedbackMessage: correct
        ? 'Correct! T2 images show bright CSF and are excellent for detecting pathology.'
        : 'This is a T2 image. Remember: T2 has BRIGHT ventricles (CSF), while T1 has DARK ventricles.',
    };
  }
}
