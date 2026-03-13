'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DNADimension } from '@travelmatch/shared';
import { DNA_DIMENSIONS } from '@travelmatch/shared';

export interface DestinationFormData {
  name: string;
  slug: string;
  description: string;
  state: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  climate_type: string;
  best_months: number[];
  tags: string[];
  cover_url: string;
  photo_urls: string[];
  min_days: number;
  max_days: number;
  avg_daily_cost: number;
  scores: Record<DNADimension, number>;
}

function buildVector(scores: Record<DNADimension, number>): string {
  const values = DNA_DIMENSIONS.map((dim) => scores[dim] ?? 50);
  return `[${values.join(',')}]`;
}

export async function createDestination(data: DestinationFormData) {
  const supabase = await createClient();

  const { data: dest, error } = await supabase
    .from('destinations')
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      state: data.state,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
      climate_type: data.climate_type || null,
      best_months: data.best_months,
      tags: data.tags,
      cover_url: data.cover_url || null,
      photo_urls: data.photo_urls,
      min_days: data.min_days,
      max_days: data.max_days,
      avg_daily_cost: data.avg_daily_cost,
      destination_vector: buildVector(data.scores),
      is_active: false,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Insert dimension scores (trigger will rebuild vector)
  const scoreRows = DNA_DIMENSIONS.map((dim) => ({
    destination_id: dest.id,
    dimension: dim,
    score: data.scores[dim] ?? 50,
  }));

  await supabase.from('destination_scores').insert(scoreRows);

  revalidatePath('/destinations');
  return { id: dest.id };
}

export async function updateDestination(id: string, data: DestinationFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('destinations')
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      state: data.state,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
      climate_type: data.climate_type || null,
      best_months: data.best_months,
      tags: data.tags,
      cover_url: data.cover_url || null,
      photo_urls: data.photo_urls,
      min_days: data.min_days,
      max_days: data.max_days,
      avg_daily_cost: data.avg_daily_cost,
      destination_vector: buildVector(data.scores),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  // Upsert scores
  for (const dim of DNA_DIMENSIONS) {
    await supabase
      .from('destination_scores')
      .upsert(
        { destination_id: id, dimension: dim, score: data.scores[dim] ?? 50 },
        { onConflict: 'destination_id,dimension' },
      );
  }

  revalidatePath('/destinations');
  return { id };
}

export async function toggleDestinationActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('destinations')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/destinations');
  return { success: true };
}

export async function duplicateDestination(id: string) {
  const supabase = await createClient();

  const { data: original } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single();

  if (!original) return { error: 'Destino não encontrado' };

  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = original;

  const { data: newDest, error } = await supabase
    .from('destinations')
    .insert({
      ...rest,
      name: `${original.name} (cópia)`,
      slug: `${original.slug}-copia-${Date.now()}`,
      is_active: false,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Copy scores
  const { data: scores } = await supabase
    .from('destination_scores')
    .select('dimension, score')
    .eq('destination_id', id);

  if (scores && scores.length > 0) {
    await supabase.from('destination_scores').insert(
      scores.map((s) => ({ destination_id: newDest.id, dimension: s.dimension, score: s.score })),
    );
  }

  revalidatePath('/destinations');
  return { id: newDest.id };
}
