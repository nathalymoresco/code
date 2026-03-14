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

export type DestinationRegion = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

export type PartnerType = 'hotel' | 'pousada' | 'airbnb' | 'guia' | 'restaurante' | 'transfer' | 'experiencia';

export type ContractStatus = 'pending' | 'active' | 'inactive' | 'suspended';

export type PriceRange = 'economico' | 'moderado' | 'premium';

export interface Partner {
  id: string;
  destination_id: string;
  name: string;
  type: PartnerType;
  description: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price_range: PriceRange | null;
  daily_rate: number | null;
  rating: number;
  review_count: number;
  is_curated: boolean;
  contract_status: ContractStatus;
  cover_url: string | null;
  photo_urls: string[];
  amenities: string[];
  cancellation_policy: string | null;
  asaas_wallet_id: string | null;
  split_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface DestinationScore {
  id: string;
  destination_id: string;
  dimension: DNADimension;
  score: number;
}

export interface CompatibilityResult {
  destination_id: string;
  name: string;
  slug: string;
  description: string | null;
  state: string;
  city: string;
  region: string;
  cover_url: string | null;
  photo_urls: string[];
  tags: string[];
  best_months: number[];
  avg_daily_cost: number | null;
  min_days: number;
  max_days: number;
  score: number;           // 0-100 final score
  cosine_similarity: number; // raw cosine similarity
  match_reasons: string[];
}

export interface CompatibilityResponse {
  destinations: CompatibilityResult[];
  cached: boolean;
  profile_completeness: number;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
}
