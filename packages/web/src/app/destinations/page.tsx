import { DestinationsFeed } from './destinations-feed';

export const metadata = {
  title: 'Destinos | TravelMatch BR',
  description: 'Descubra destinos brasileiros personalizados para o seu perfil de viagem.',
};

export default function DestinationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sand-800">Destinos para Você</h1>
        <p className="mt-1 text-sand-500">
          Destinos recomendados com base no seu DNA de Viagem
        </p>
      </div>
      <DestinationsFeed />
    </div>
  );
}
