import { describe, it, expect } from 'vitest';
import { DNA_DIMENSIONS } from '../../constants/dna-dimensions';
import quizQuestions from '../../../data/quiz-questions.json';

interface QuizQuestionJSON {
  id: string;
  questionIndex: number;
  phase: number;
  text: string;
  type: string;
  maxSelections?: number;
  options: {
    id: string;
    label: string;
    emoji: string;
    description: string;
    dimensionsAffected: Record<string, number>;
  }[];
}

const questions = quizQuestions as QuizQuestionJSON[];

describe('quiz-questions.json', () => {
  it('has exactly 10 questions', () => {
    expect(questions).toHaveLength(10);
  });

  it('has 3 phase-1 questions and 7 phase-2 questions', () => {
    const phase1 = questions.filter((q) => q.phase === 1);
    const phase2 = questions.filter((q) => q.phase === 2);
    expect(phase1).toHaveLength(3);
    expect(phase2).toHaveLength(7);
  });

  it('has sequential questionIndex (0-9)', () => {
    const indices = questions.map((q) => q.questionIndex).sort((a, b) => a - b);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('covers all 10 DNA dimensions', () => {
    const covered = new Set<string>();
    for (const q of questions) {
      for (const opt of q.options) {
        for (const dim of Object.keys(opt.dimensionsAffected)) {
          covered.add(dim);
        }
      }
    }
    for (const dim of DNA_DIMENSIONS) {
      expect(covered.has(dim)).toBe(true);
    }
  });

  it('each question has at least 2 options', () => {
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each option has required fields', () => {
    for (const q of questions) {
      for (const opt of q.options) {
        expect(opt.id).toBeTruthy();
        expect(opt.label).toBeTruthy();
        expect(opt.emoji).toBeTruthy();
        expect(opt.description).toBeTruthy();
        expect(Object.keys(opt.dimensionsAffected).length).toBeGreaterThan(0);
      }
    }
  });
});
