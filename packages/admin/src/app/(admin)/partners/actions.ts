'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PartnerFormData {
  destination_id: string;
  name: string;
  type: string;
  description: string;
  whatsapp: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  price_range: string;
  daily_rate: number | null;
  cover_url: string;
  photo_urls: string[];
  amenities: string[];
  cancellation_policy: string;
}

export async function createPartner(data: PartnerFormData) {
  const supabase = await createClient();

  const { data: partner, error } = await supabase
    .from('partners')
    .insert({
      destination_id: data.destination_id,
      name: data.name,
      type: data.type,
      description: data.description || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      address: data.address || null,
      latitude: data.latitude,
      longitude: data.longitude,
      price_range: data.price_range || null,
      daily_rate: data.daily_rate,
      cover_url: data.cover_url || null,
      photo_urls: data.photo_urls,
      amenities: data.amenities,
      cancellation_policy: data.cancellation_policy || null,
      is_curated: false,
      contract_status: 'pending',
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/partners');
  return { id: partner.id };
}

export async function updatePartner(id: string, data: PartnerFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('partners')
    .update({
      destination_id: data.destination_id,
      name: data.name,
      type: data.type,
      description: data.description || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      address: data.address || null,
      latitude: data.latitude,
      longitude: data.longitude,
      price_range: data.price_range || null,
      daily_rate: data.daily_rate,
      cover_url: data.cover_url || null,
      photo_urls: data.photo_urls,
      amenities: data.amenities,
      cancellation_policy: data.cancellation_policy || null,
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/partners');
  return { id };
}

export async function curatePartner(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('partners')
    .update({ is_curated: true, contract_status: 'active' })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/partners');
  return { success: true };
}

export async function updatePartnerStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('partners')
    .update({ contract_status: status })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/partners');
  return { success: true };
}
