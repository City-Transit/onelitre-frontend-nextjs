'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Vendor } from '@/lib/types';

const GRADIENTS = [
  'from-paprika/70 to-bg',
  'from-frost/60 to-bg',
  'from-paprika-dim/70 to-bg-alt',
];

export function MenuBrowser({ vendors }: { vendors: Vendor[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;

    return vendors.filter((vendor) => {
      if (vendor.name.toLowerCase().includes(q)) return true;
      return vendor.meals.some(
        (meal) =>
          meal.name.toLowerCase().includes(q) ||
          (meal.description ?? '').toLowerCase().includes(q),
      );
    });
  }, [vendors, query]);

  return (
    <>
      <div className="mt-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vendors or meals — e.g. Jollof Rice, Egusi Soup"
          className="w-full max-w-lg rounded-[3px] border border-line bg-bg-alt px-4 py-3.5 text-[15px] text-paper placeholder:text-muted focus:border-frost focus:outline-none"
        />
      </div>

      <div className="mt-8">
        {vendors.length === 0 && (
          <p className="border-t border-line py-12 text-muted">
            No vendors are live yet — check back soon.
          </p>
        )}

        {vendors.length > 0 && filtered.length === 0 && (
          <p className="border-t border-line py-12 text-muted">
            No vendors or meals match &ldquo;{query}&rdquo;.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vendor, vi) => {
            const coverImage = vendor.meals.find((m) => m.imageUrl)?.imageUrl;
            const mealCount = vendor.meals.length;
            return (
              <Link
                key={vendor.id}
                href={`/menu/${vendor.id}`}
                className="flex flex-col overflow-hidden rounded-lg border border-line bg-bg-alt transition-colors hover:border-frost"
              >
                <div className="relative aspect-[4/3]">
                  {coverImage ? (
                    <Image
                      src={coverImage}
                      alt={vendor.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                      priority={vi === 0}
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center bg-gradient-to-br text-4xl ${GRADIENTS[vi % GRADIENTS.length]}`}
                    >
                      🍲
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  <h3 className="text-lg leading-snug text-paper">{vendor.name}</h3>
                  <div className="font-mono text-xs text-frost">{vendor.area}</div>
                  <div className="mt-auto flex items-center justify-between pt-3 text-[13px] text-muted">
                    <span>
                      {mealCount} {mealCount === 1 ? 'meal' : 'meals'}
                    </span>
                    {vendor.ratingCount ? (
                      <span className="text-paprika">
                        ★ {vendor.ratingAverage?.toFixed(1)} ({vendor.ratingCount})
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
