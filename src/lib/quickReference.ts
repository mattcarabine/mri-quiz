/**
 * Shared quick reference data for T1 vs T2 MRI comparison
 * Used across SessionSelector and explanation screens
 */

export interface QuickReferenceRow {
  characteristic: string;
  t1: {
    display: string;
    indicator?: 'dark' | 'bright' | 'intermediate';
  };
  t2: {
    display: string;
    indicator?: 'dark' | 'bright' | 'intermediate';
  };
}

export const quickReferenceData: QuickReferenceRow[] = [
  {
    characteristic: 'CSF (Cerebrospinal Fluid)',
    t1: { display: 'DARK', indicator: 'dark' },
    t2: { display: 'BRIGHT', indicator: 'bright' },
  },
  {
    characteristic: 'Fat',
    t1: { display: 'BRIGHT', indicator: 'bright' },
    t2: { display: 'Less Bright', indicator: 'intermediate' },
  },
  {
    characteristic: 'Gray vs White Matter',
    t1: { display: 'White Brighter', indicator: 'intermediate' },
    t2: { display: 'Gray Brighter', indicator: 'intermediate' },
  },
  {
    characteristic: 'Best For',
    t1: { display: 'Anatomy' },
    t2: { display: 'Pathology & Edema' },
  },
  {
    characteristic: 'Memory Aid',
    t1: { display: 'T1 = ONE anatomy scan' },
    t2: { display: 'T2 = TWO = H₂O (water bright)' },
  },
];

/**
 * Key differentiator message used across both T1 and T2 explanations
 */
export const keyDifferentiator = 'Look at the ventricles (CSF spaces) - DARK in T1, BRIGHT in T2';
