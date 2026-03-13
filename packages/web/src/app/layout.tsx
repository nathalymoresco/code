import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TravelMatch BR — Viagens com DNA Personalizado',
  description:
    'Descubra seu DNA de Viagem e encontre destinos perfeitos para seu perfil. A primeira plataforma brasileira de viagens com personalização real.',
  keywords: ['viagem', 'personalizada', 'DNA', 'destinos', 'Brasil', 'turismo'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#14b8a6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-sand-50 font-sans text-sand-900 antialiased">
        {children}
      </body>
    </html>
  );
}
