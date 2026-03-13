'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DNA_DIMENSIONS, DNA_DIMENSION_LABELS } from '@travelmatch/shared';
import type { DNADimension, Destination, DestinationScore } from '@travelmatch/shared';
import { createDestination, updateDestination, type DestinationFormData } from './actions';

const REGIONS = [
  { value: 'norte', label: 'Norte' },
  { value: 'nordeste', label: 'Nordeste' },
  { value: 'centro-oeste', label: 'Centro-Oeste' },
  { value: 'sudeste', label: 'Sudeste' },
  { value: 'sul', label: 'Sul' },
];

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

interface DestinationFormProps {
  destination?: Destination;
  scores?: DestinationScore[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function DestinationForm({ destination, scores }: DestinationFormProps) {
  const router = useRouter();
  const isEditing = !!destination;

  const initialScores = DNA_DIMENSIONS.reduce(
    (acc, dim) => {
      const existing = scores?.find((s) => s.dimension === dim);
      acc[dim] = existing?.score ?? 50;
      return acc;
    },
    {} as Record<DNADimension, number>,
  );

  const [name, setName] = useState(destination?.name ?? '');
  const [slug, setSlug] = useState(destination?.slug ?? '');
  const [description, setDescription] = useState(destination?.description ?? '');
  const [state, setState] = useState(destination?.state ?? '');
  const [city, setCity] = useState(destination?.city ?? '');
  const [region, setRegion] = useState(destination?.region ?? 'sudeste');
  const [latitude, setLatitude] = useState(destination?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(destination?.longitude?.toString() ?? '');
  const [climateType, setClimateType] = useState(destination?.climate_type ?? '');
  const [bestMonths, setBestMonths] = useState<number[]>(destination?.best_months ?? []);
  const [tags, setTags] = useState(destination?.tags?.join(', ') ?? '');
  const [coverUrl, setCoverUrl] = useState(destination?.cover_url ?? '');
  const [photoUrls, setPhotoUrls] = useState(destination?.photo_urls?.join('\n') ?? '');
  const [minDays, setMinDays] = useState(destination?.min_days?.toString() ?? '3');
  const [maxDays, setMaxDays] = useState(destination?.max_days?.toString() ?? '7');
  const [avgDailyCost, setAvgDailyCost] = useState(destination?.avg_daily_cost?.toString() ?? '');
  const [dimScores, setDimScores] = useState(initialScores);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!isEditing) setSlug(slugify(value));
  }

  function toggleMonth(month: number) {
    setBestMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !state || !city || !slug) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    const formData: DestinationFormData = {
      name,
      slug,
      description,
      state: state.toUpperCase(),
      city,
      region,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      climate_type: climateType,
      best_months: bestMonths,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      cover_url: coverUrl,
      photo_urls: photoUrls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean),
      min_days: parseInt(minDays) || 3,
      max_days: parseInt(maxDays) || 7,
      avg_daily_cost: parseFloat(avgDailyCost) || 0,
      scores: dimScores,
    };

    const result = isEditing
      ? await updateDestination(destination.id, formData)
      : await createDestination(formData);

    if ('error' in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/destinations');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-sand-800">Informações Básicas</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Nome *</label>
            <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Slug *</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm outline-none focus:border-turquoise-500"
          />
        </div>
      </Card>

      {/* Location */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-sand-800">Localização</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Cidade *</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">UF *</label>
            <Input value={state} onChange={(e) => setState(e.target.value)} maxLength={2} required placeholder="GO" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Região</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-9 w-full rounded-md border border-sand-200 bg-white px-3 text-sm outline-none focus:border-turquoise-500"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Latitude</label>
            <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="-14.0861" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Longitude</label>
            <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-47.5277" />
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-sand-800">Detalhes</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Tipo de Clima</label>
            <Input value={climateType} onChange={(e) => setClimateType(e.target.value)} placeholder="tropical" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Dias mínimos</label>
            <Input type="number" value={minDays} onChange={(e) => setMinDays(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Dias máximos</label>
            <Input type="number" value={maxDays} onChange={(e) => setMaxDays(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">Custo médio diário (R$)</label>
          <Input type="number" step="0.01" value={avgDailyCost} onChange={(e) => setAvgDailyCost(e.target.value)} placeholder="350.00" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">Tags (separadas por vírgula)</label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="natureza, ecoturismo, cachoeiras" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-sand-700">Melhores meses</label>
          <div className="flex flex-wrap gap-2">
            {MONTHS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleMonth(i + 1)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  bestMonths.includes(i + 1)
                    ? 'bg-turquoise-600 text-white'
                    : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Images */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-sand-800">Imagens</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">URL da Cover</label>
          <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">URLs da galeria (uma por linha)</label>
          <textarea
            value={photoUrls}
            onChange={(e) => setPhotoUrls(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm outline-none focus:border-turquoise-500"
            placeholder={"https://img1.jpg\nhttps://img2.jpg\nhttps://img3.jpg"}
          />
        </div>
      </Card>

      {/* DNA Dimension Scores */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-sand-800">Scores por Dimensão DNA</h2>
        <p className="text-sm text-sand-500">Defina de 0 a 100 para cada dimensão. O vetor de matching será calculado automaticamente.</p>

        <div className="space-y-3">
          {DNA_DIMENSIONS.map((dim) => (
            <div key={dim} className="flex items-center gap-3">
              <span className="w-28 text-sm font-medium text-sand-700">
                {DNA_DIMENSION_LABELS[dim]}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={dimScores[dim]}
                onChange={(e) =>
                  setDimScores((prev) => ({ ...prev, [dim]: parseInt(e.target.value) }))
                }
                className="flex-1 accent-turquoise-600"
                data-testid={`score-${dim}`}
              />
              <span className="w-10 text-right text-sm text-sand-500">{dimScores[dim]}%</span>
            </div>
          ))}
        </div>
      </Card>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          className="bg-turquoise-600 hover:bg-turquoise-700"
          disabled={loading}
        >
          {loading ? 'Salvando...' : isEditing ? 'Atualizar Destino' : 'Criar Destino'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/destinations')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
