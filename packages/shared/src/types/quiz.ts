import type { DNADimension } from '../constants/dna-dimensions';

export interface QuizOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
  dimensionsAffected: Partial<Record<DNADimension, number>>;
}

export interface QuizQuestion {
  id: string;
  questionIndex: number;
  phase: 1 | 2;
  text: string;
  type: 'swipe' | 'multi-select' | 'slider';
  maxSelections?: number;
  options: QuizOption[];
}

export interface QuizAnswer {
  questionIndex: number;
  optionIds: string[];
  dimensionsAffected: Partial<Record<DNADimension, number>>;
}

export interface DNAResult {
  dimensions: Record<DNADimension, number>;
  vector: number[];
  label: string;
  labelEmoji: string;
  completeness: number;
}

export interface DNALabelEntry {
  top1: DNADimension | 'any';
  top2: DNADimension | 'any';
  label: string;
  emoji: string;
  condition?: 'sociabilidade_low';
}
