'use client';

import { useState, useTransition } from 'react';
import type { QuizQuestion, QuizAnswer } from '@travelmatch/shared';
import { calculateDNA } from '@travelmatch/shared';
import { Button } from '@/components/ui/button';
import { QuizCard } from './quiz-card';
import { QuizProgress } from './quiz-progress';
import { saveQuizAnswer, submitQuizResults } from '@/app/quiz/actions';
import { useRouter } from 'next/navigation';

interface QuizContainerProps {
  questions: QuizQuestion[];
  existingAnswers: QuizAnswer[];
}

export function QuizContainer({ questions, existingAnswers }: QuizContainerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const answeredIndices = new Set(existingAnswers.map((a) => a.questionIndex));
  const firstUnanswered = questions.findIndex((q) => !answeredIndices.has(q.questionIndex));
  const startIndex = firstUnanswered === -1 ? 0 : firstUnanswered;

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [answers, setAnswers] = useState<QuizAnswer[]>(existingAnswers);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const maybeQuestion = questions[currentIndex];
  if (!maybeQuestion) return null;
  const currentQuestion: QuizQuestion = maybeQuestion;

  const phase: 1 | 2 = currentQuestion.phase;
  const phaseQuestions = questions.filter((q) => q.phase === phase);
  const phaseIndex = phaseQuestions.findIndex(
    (q) => q.questionIndex === currentQuestion.questionIndex,
  );

  function advanceQuestion(currentAnswers: QuizAnswer[]) {
    const nextIndex = currentIndex + 1;

    if (nextIndex === 3 && currentAnswers.length >= 3) {
      const result = calculateDNA(currentAnswers);
      startTransition(async () => {
        await submitQuizResults(
          result.dimensions,
          result.vector,
          result.label,
          result.labelEmoji,
          1,
        );
        router.push('/quiz/result?phase=1');
      });
      return;
    }

    if (nextIndex >= questions.length) {
      const result = calculateDNA(currentAnswers);
      startTransition(async () => {
        await submitQuizResults(
          result.dimensions,
          result.vector,
          result.label,
          result.labelEmoji,
          2,
        );
        router.push('/quiz/result?phase=2');
      });
      return;
    }

    setCurrentIndex(nextIndex);
  }

  function handleSelect(optionId: string) {
    if (currentQuestion.type === 'multi-select') {
      setSelectedOptions((prev) => {
        if (prev.includes(optionId)) {
          return prev.filter((id) => id !== optionId);
        }
        const max = currentQuestion.maxSelections ?? 3;
        if (prev.length >= max) return prev;
        return [...prev, optionId];
      });
    } else {
      const option = currentQuestion.options.find((o) => o.id === optionId);
      if (!option) return;

      const answer: QuizAnswer = {
        questionIndex: currentQuestion.questionIndex,
        optionIds: [optionId],
        dimensionsAffected: option.dimensionsAffected,
      };

      const newAnswers = [
        ...answers.filter((a) => a.questionIndex !== currentQuestion.questionIndex),
        answer,
      ];
      setAnswers(newAnswers);

      startTransition(async () => {
        await saveQuizAnswer(currentQuestion.questionIndex, answer);
        advanceQuestion(newAnswers);
      });
    }
  }

  function handleMultiSelectConfirm() {
    if (selectedOptions.length === 0) return;

    const selectedOpts = currentQuestion.options.filter((o) =>
      selectedOptions.includes(o.id),
    );
    const merged: Partial<Record<string, number>> = {};
    for (const opt of selectedOpts) {
      for (const [dim, weight] of Object.entries(opt.dimensionsAffected)) {
        merged[dim] = (merged[dim] ?? 0) + weight;
      }
    }

    const answer: QuizAnswer = {
      questionIndex: currentQuestion.questionIndex,
      optionIds: selectedOptions,
      dimensionsAffected: merged,
    };

    const newAnswers = [
      ...answers.filter((a) => a.questionIndex !== currentQuestion.questionIndex),
      answer,
    ];
    setAnswers(newAnswers);
    setSelectedOptions([]);

    startTransition(async () => {
      await saveQuizAnswer(currentQuestion.questionIndex, answer);
      advanceQuestion(newAnswers);
    });
  }

  function handleSkip() {
    const answer: QuizAnswer = {
      questionIndex: currentQuestion.questionIndex,
      optionIds: ['skip'],
      dimensionsAffected: {},
    };
    const newAnswers = [
      ...answers.filter((a) => a.questionIndex !== currentQuestion.questionIndex),
      answer,
    ];
    setAnswers(newAnswers);

    startTransition(async () => {
      await saveQuizAnswer(currentQuestion.questionIndex, answer);
      advanceQuestion(newAnswers);
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <QuizProgress current={phaseIndex} total={phaseQuestions.length} phase={phase} />

      <div className="space-y-4">
        <h2 className="text-center text-xl font-bold text-sand-900">
          {currentQuestion.text}
        </h2>

        <div
          className={
            currentQuestion.type === 'multi-select' ? 'grid grid-cols-2 gap-3' : 'space-y-3'
          }
        >
          {currentQuestion.options.map((option) => (
            <QuizCard
              key={option.id}
              emoji={option.emoji}
              label={option.label}
              description={option.description}
              selected={
                currentQuestion.type === 'multi-select'
                  ? selectedOptions.includes(option.id)
                  : false
              }
              onClick={() => handleSelect(option.id)}
            />
          ))}
        </div>

        {currentQuestion.type === 'multi-select' && (
          <Button
            onClick={handleMultiSelectConfirm}
            disabled={selectedOptions.length === 0 || isPending}
            className="w-full bg-turquoise-600 hover:bg-turquoise-700"
            size="lg"
          >
            {isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        )}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSkip}
          disabled={isPending}
          className="text-sm text-sand-400 hover:text-sand-600"
        >
          Pular pergunta
        </button>
      </div>
    </div>
  );
}
