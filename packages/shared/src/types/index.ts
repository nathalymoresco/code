import type { DNADimension } from '../constants/dna-dimensions';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  cpf: string | null;
  lgpd_consent: boolean;
  lgpd_consent_at: string | null;
  preferences: Record<string, unknown>;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface DNAProfile {
  id: string;
  profile_id: string;
  label: string | null;
  quiz_phase: number;
  dimensions: Record<DNADimension, number>;
  compatibility_vector: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  state: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  climate_type: string | null;
  best_months: number[];
  tags: string[];
  cover_url: string | null;
  photo_urls: string[];
  is_active: boolean;
  min_days: number;
  max_days: number;
  avg_daily_cost: number;
  destination_vector: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}
