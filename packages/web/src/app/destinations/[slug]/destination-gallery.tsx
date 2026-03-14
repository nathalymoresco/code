'use client';

import { useState } from 'react';

interface DestinationGalleryProps {
  photos: string[];
  name: string;
}

export function DestinationGallery({ photos, name }: DestinationGalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="gallery">
        {photos.slice(0, 8).map((url, i) => (
          <button
            key={url}
            onClick={() => setSelected(url)}
            className="aspect-[4/3] overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
          >
            <img
              src={url}
              alt={`${name} foto ${i + 1}`}
              className="size-full object-cover transition hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
          data-testid="lightbox"
        >
          <img
            src={selected}
            alt={name}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
