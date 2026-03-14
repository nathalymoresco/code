import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { PackageView } from './package-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pkg } = await supabase
    .from('packages')
    .select('destinations(name)')
    .eq('id', id)
    .single();

  const dest = pkg?.destinations as unknown as { name: string } | null;

  return {
    title: dest ? `Pacote: ${dest.name} | TravelMatch BR` : 'Meu Pacote | TravelMatch BR',
  };
}

export default async function PackagePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect('/login');

  // Fetch package (only owner)
  const { data: pkg } = await supabase
    .from('packages')
    .select('*, destinations(name, slug, cover_url, city, state)')
    .eq('id', id)
    .eq('profile_id', profile.id)
    .single();

  if (!pkg) notFound();

  // Fetch items
  const { data: items } = await supabase
    .from('package_items')
    .select('*, partners(name, cover_url, rating, review_count)')
    .eq('package_id', id)
    .order('day_number')
    .order('sort_order');

  return (
    <PackageView
      pkg={pkg}
      items={items ?? []}
    />
  );
}
