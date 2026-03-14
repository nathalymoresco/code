'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { Partner, Destination } from '@travelmatch/shared';
import { createPartner, updatePartner, type PartnerFormData } from './actions';

const PARTNER_TYPES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'pousada', label: 'Pousada' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'guia', label: 'Guia' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'experiencia', label: 'Experiência' },
] as const;

type PartnerTypeValue = (typeof PARTNER_TYPES)[number]['value'];

const PRICE_RANGES = [
  { value: 'economico', label: 'Econômico' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'premium', label: 'Premium' },
] as const;

type PriceRangeValue = (typeof PRICE_RANGES)[number]['value'];

interface PartnerFormProps {
  partner?: Partner;
  destinations: Pick<Destination, 'id' | 'name'>[];
}

export function PartnerForm({ partner, destinations }: PartnerFormProps) {
  const router = useRouter();
  const isEditing = !!partner;

  const [destinationId, setDestinationId] = useState(partner?.destination_id ?? '');
  const [name, setName] = useState(partner?.name ?? '');
  const [type, setType] = useState<PartnerTypeValue>((partner?.type as PartnerTypeValue) ?? 'pousada');
  const [description, setDescription] = useState(partner?.description ?? '');
  const [whatsapp, setWhatsapp] = useState(partner?.whatsapp ?? '');
  const [email, setEmail] = useState(partner?.email ?? '');
  const [address, setAddress] = useState(partner?.address ?? '');
  const [latitude, setLatitude] = useState(partner?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(partner?.longitude?.toString() ?? '');
  const [priceRange, setPriceRange] = useState<PriceRangeValue>((partner?.price_range as PriceRangeValue) ?? 'moderado');
  const [dailyRate, setDailyRate] = useState(partner?.daily_rate?.toString() ?? '');
  const [coverUrl, setCoverUrl] = useState(partner?.cover_url ?? '');
  const [photoUrls, setPhotoUrls] = useState(partner?.photo_urls?.join('\n') ?? '');
  const [amenities, setAmenities] = useState(partner?.amenities?.join(', ') ?? '');
  const [cancellationPolicy, setCancellationPolicy] = useState(partner?.cancellation_policy ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !destinationId || !type) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    const formData: PartnerFormData = {
      destination_id: destinationId,
      name,
      type,
      description,
      whatsapp,
      email,
      address,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      price_range: priceRange,
      daily_rate: dailyRate ? parseFloat(dailyRate) : null,
      cover_url: coverUrl,
      photo_urls: photoUrls.split('\n').map((u) => u.trim()).filter(Boolean),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
      cancellation_policy: cancellationPolicy,
    };

    const result = isEditing
      ? await updatePartner(partner.id, formData)
      : await createPartner(formData);

    if ('error' in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/partners');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-sand-800">Informações Básicas</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Destino *</label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              required
              className="h-9 w-full rounded-md border border-sand-200 bg-white px-3 text-sm outline-none focus:border-turquoise-500"
              data-testid="select-destination"
            >
              <option value="">Selecione um destino</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Tipo *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PartnerTypeValue)}
              className="h-9 w-full rounded-md border border-sand-200 bg-white px-3 text-sm outline-none focus:border-turquoise-500"
              data-testid="select-type"
            >
              {PARTNER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">Nome *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
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

      {/* Contact */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-sand-800">Contato & Localização</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">WhatsApp</label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55 62 99999-0000" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">Endereço</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Latitude</label>
            <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Longitude</label>
            <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Pricing */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-sand-800">Preço & Amenidades</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Faixa de preço</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as PriceRangeValue)}
              className="h-9 w-full rounded-md border border-sand-200 bg-white px-3 text-sm outline-none focus:border-turquoise-500"
            >
              {PRICE_RANGES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-sand-700">Diária base (R$)</label>
            <Input type="number" step="0.01" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} placeholder="250.00" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">Amenidades (separadas por vírgula)</label>
          <Input value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="wifi, piscina, ar-condicionado, café da manhã" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-sand-700">Política de cancelamento</label>
          <textarea
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm outline-none focus:border-turquoise-500"
            placeholder="Cancelamento gratuito até 7 dias antes..."
          />
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
            rows={3}
            className="w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm outline-none focus:border-turquoise-500"
          />
        </div>
      </Card>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" className="bg-turquoise-600 hover:bg-turquoise-700" disabled={loading}>
          {loading ? 'Salvando...' : isEditing ? 'Atualizar Parceiro' : 'Criar Parceiro'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/partners')}>Cancelar</Button>
      </div>
    </form>
  );
}
