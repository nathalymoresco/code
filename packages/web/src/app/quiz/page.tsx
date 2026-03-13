import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QuizContainer } from '@/components/quiz/quiz-container';
import { getExistingAnswers, getExistingDNA } from './actions';
import quizQuestions from '@travelmatch/shared/data/quiz-questions.json';
import type { QuizQuestion } from '@travelmatch/shared';

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if DNA already complete
  const existingDNA = await getExistingDNA();
  if (existingDNA && existingDNA.completeness_percentage >= 95) {
    redirect('/profile/dna');
  }

  const existingAnswers = await getExistingAnswers();

  return (
    <main className="flex min-h-screen flex-col items-center bg-sand-50 px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-turquoise-600">Descubra seu DNA de Viagem</h1>
        <p className="mt-1 text-sm text-sand-500">Responda as perguntas e descubra seu perfil</p>
      </div>
      <QuizContainer
        questions={quizQuestions as QuizQuestion[]}
        existingAnswers={existingAnswers}
      />
    </main>
  );
}
