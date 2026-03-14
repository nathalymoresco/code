import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DestinationDetail } from './destination-detail';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: dest } = await supabase
    .from('destinations')
    .select('name, description, state, city, cover_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!dest) return { title: 'Destino não encontrado' };

  return {
    title: `${dest.name} — ${dest.city}, ${dest.state} | TravelMatch BR`,
    description: dest.description || `Descubra ${dest.name} com recomendações personalizadas.`,
    openGraph: {
      title: `${dest.name} | TravelMatch BR`,
      description: dest.description || `Explore ${dest.name}`,
      images: dest.cover_url ? [{ url: dest.cover_url }] : [],
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch destination
  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!destination) notFound();

  // Fetch dimension scores
  const { data: scores } = await supabase
    .from('destination_scores')
    .select('dimension, score')
    .eq('destination_id', destination.id);

  // Fetch curated partners
  const { data: partners } = await supabase
    .from('partners')
    .select('id, name, type, description, cover_url, price_range, daily_rate, rating, review_count, amenities')
    .eq('destination_id', destination.id)
    .eq('is_curated', true)
    .eq('contract_status', 'active')
    .order('type')
    .order('rating', { ascending: false });

  return (
    <DestinationDetail
      destination={destination}
      scores={scores ?? []}
      partners={partners ?? []}
    />
  );
}
