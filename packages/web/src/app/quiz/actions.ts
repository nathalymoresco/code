'use server';

import { createClient } from '@/lib/supabase/server';
import type { DNADimension, QuizAnswer } from '@travelmatch/shared';

export async function saveQuizAnswer(questionIndex: number, answer: QuizAnswer) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get profile id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const { error } = await supabase.from('quiz_responses').upsert(
    {
      profile_id: profile.id,
      question_index: questionIndex,
      phase: questionIndex < 3 ? 1 : 2,
      answer: {
        option_ids: answer.optionIds,
        dimensions_affected: answer.dimensionsAffected,
      },
    },
    { onConflict: 'profile_id,question_index' },
  );

  if (error) {
    console.error('saveQuizAnswer error:', error);
    throw new Error(`Failed to save answer: ${error.message}`);
  }
}

export async function submitQuizResults(
  dimensions: Record<DNADimension, number>,
  vector: number[],
  label: string,
  labelEmoji: string,
  phase: 1 | 2,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const completeness = phase === 1 ? 40 : 95;
  const vectorString = `[${vector.join(',')}]`;

  // Upsert dna_profiles
  await supabase.from('dna_profiles').upsert(
    {
      profile_id: profile.id,
      dimensions,
      compatibility_vector: vectorString,
      label,
      label_emoji: labelEmoji,
      completeness_percentage: completeness,
      quiz_phase: phase,
    },
    { onConflict: 'profile_id' },
  );

  // Insert history snapshot
  await supabase.from('dna_history').insert({
    profile_id: profile.id,
    dimensions,
    compatibility_vector: vectorString,
    label,
    source: 'quiz',
  });
}

export async function getExistingAnswers(): Promise<QuizAnswer[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return [];

  const { data: responses } = await supabase
    .from('quiz_responses')
    .select('question_index, answer')
    .eq('profile_id', profile.id)
    .order('question_index');

  if (!responses) return [];

  return responses.map((r) => ({
    questionIndex: r.question_index,
    optionIds: (r.answer as { option_ids: string[] }).option_ids ?? [],
    dimensionsAffected: (r.answer as { dimensions_affected: Record<string, number> }).dimensions_affected ?? {},
  }));
}

export async function getExistingDNA() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) return null;

  const { data: dna } = await supabase
    .from('dna_profiles')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  return dna;
}
