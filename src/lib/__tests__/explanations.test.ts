import { describe, it, expect } from 'vitest';
import { getExplanation } from '../explanations';

describe('explanations', () => {
  describe('getExplanation for T1 images', () => {
    it('should return T1 title', () => {
      const explanation = getExplanation('T1', true);
      expect(explanation.title).toBe('T1-Weighted Image');
    });

    it('should include correct T1 characteristics', () => {
      const explanation = getExplanation('T1', true);

      expect(explanation.characteristics).toContain('CSF (cerebrospinal fluid) appears DARK');
      expect(explanation.characteristics).toContain('Fat appears BRIGHT');
      expect(explanation.characteristics).toContain('White matter appears brighter than gray matter');
      expect(explanation.characteristics).toContain('Good for anatomical detail');
      expect(explanation.characteristics).toHaveLength(4);
    });

    it('should provide T1 memory aid', () => {
      const explanation = getExplanation('T1', true);
      expect(explanation.memoryAid).toBe('T1 = ONE anatomy scan - fat bright, water dark');
    });

    it('should provide key differentiator mentioning ventricles', () => {
      const explanation = getExplanation('T1', true);
      expect(explanation.keyDifferentiator).toContain('ventricles');
      expect(explanation.keyDifferentiator).toContain('DARK in T1');
      expect(explanation.keyDifferentiator).toContain('BRIGHT in T2');
    });

    it('should provide positive feedback when answer is correct', () => {
      const explanation = getExplanation('T1', true);
      expect(explanation.feedbackMessage).toContain('Correct');
      expect(explanation.feedbackMessage).toContain('dark CSF');
      expect(explanation.feedbackMessage).toContain('bright fat');
    });

    it('should provide corrective feedback when answer is incorrect', () => {
      const explanation = getExplanation('T1', false);
      expect(explanation.feedbackMessage).toContain('This is a T1 image');
      expect(explanation.feedbackMessage).toContain('DARK ventricles');
      expect(explanation.feedbackMessage).toContain('T2 has BRIGHT ventricles');
    });
  });

  describe('getExplanation for T2 images', () => {
    it('should return T2 title', () => {
      const explanation = getExplanation('T2', true);
      expect(explanation.title).toBe('T2-Weighted Image');
    });

    it('should include correct T2 characteristics', () => {
      const explanation = getExplanation('T2', true);

      expect(explanation.characteristics).toContain('CSF (cerebrospinal fluid) appears BRIGHT');
      expect(explanation.characteristics).toContain('Fat appears less bright than in T1');
      expect(explanation.characteristics).toContain('Gray matter appears brighter than white matter');
      expect(explanation.characteristics).toContain('Good for detecting pathology and edema');
      expect(explanation.characteristics).toHaveLength(4);
    });

    it('should provide T2 memory aid with water/H2O reference', () => {
      const explanation = getExplanation('T2', true);
      expect(explanation.memoryAid).toBe('T2 = TWO = H2O - water and fluids are bright');
      expect(explanation.memoryAid).toContain('H2O');
    });

    it('should provide key differentiator mentioning ventricles', () => {
      const explanation = getExplanation('T2', true);
      expect(explanation.keyDifferentiator).toContain('ventricles');
      expect(explanation.keyDifferentiator).toContain('DARK in T1');
      expect(explanation.keyDifferentiator).toContain('BRIGHT in T2');
    });

    it('should provide positive feedback when answer is correct', () => {
      const explanation = getExplanation('T2', true);
      expect(explanation.feedbackMessage).toContain('Correct');
      expect(explanation.feedbackMessage).toContain('bright CSF');
      expect(explanation.feedbackMessage).toContain('pathology');
    });

    it('should provide corrective feedback when answer is incorrect', () => {
      const explanation = getExplanation('T2', false);
      expect(explanation.feedbackMessage).toContain('This is a T2 image');
      expect(explanation.feedbackMessage).toContain('BRIGHT ventricles');
      expect(explanation.feedbackMessage).toContain('T1 has DARK ventricles');
    });
  });

  describe('content accuracy', () => {
    it('should emphasize CSF appearance as primary differentiator for T1', () => {
      const explanation = getExplanation('T1', true);
      const csfMentions = explanation.characteristics.filter((c) => c.includes('CSF'));
      expect(csfMentions.length).toBeGreaterThan(0);

      const darkMentions = explanation.characteristics[0];
      expect(darkMentions).toContain('DARK');
    });

    it('should emphasize CSF appearance as primary differentiator for T2', () => {
      const explanation = getExplanation('T2', true);
      const csfMentions = explanation.characteristics.filter((c) => c.includes('CSF'));
      expect(csfMentions.length).toBeGreaterThan(0);

      const brightMentions = explanation.characteristics[0];
      expect(brightMentions).toContain('BRIGHT');
    });

    it('should maintain consistent key differentiator across both types', () => {
      const t1Explanation = getExplanation('T1', true);
      const t2Explanation = getExplanation('T2', true);

      // Both should mention the same differentiator
      expect(t1Explanation.keyDifferentiator).toBe(t2Explanation.keyDifferentiator);
    });

    it('should include anatomical context (ventricles/CSF) in all explanations', () => {
      const explanations = [
        getExplanation('T1', true),
        getExplanation('T1', false),
        getExplanation('T2', true),
        getExplanation('T2', false),
      ];

      explanations.forEach((explanation) => {
        const hasCSFReference =
          explanation.keyDifferentiator.includes('ventricles') ||
          explanation.feedbackMessage.includes('ventricles') ||
          explanation.feedbackMessage.includes('CSF');
        expect(hasCSFReference).toBe(true);
      });
    });
  });
});
