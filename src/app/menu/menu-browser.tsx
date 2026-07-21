'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Vendor } from '@/lib/types';
import { CUISINE_OPTIONS, PREP_TIME_OPTIONS } from '@/lib/vendor-options';

const GRADIENTS = [
  'from-paprika/70 to-bg',
  'from-frost/60 to-bg',
  'from-paprika-dim/70 to-bg-alt',
];

const PRICE_BUCKETS = [
  { value: 'under-20k', label: 'Under ₦20,000', test: (p: number) => p < 20000 },
  { value: '20k-40k', label: '₦20,000–₦40,000', test: (p: number) => p >= 20000 && p <= 40000 },
  { value: 'over-40k', label: 'Above ₦40,000', test: (p: number) => p > 40000 },
];

const RATING_BUCKETS = [
  { value: '4', label: '4+ stars', min: 4 },
  { value: '3', label: '3+ stars', min: 3 },
];

function cheapestPrice(vendor: Vendor): number | null {
  const prices = vendor.meals.flatMap((m) => m.sizes.map((s) => s.price));
  return prices.length > 0 ? Math.min(...prices) : null;
}

const selectClass =
  'rounded-[3px] border border-line bg-bg-alt px-3 py-2.5 text-[13.5px] text-paper focus:border-frost focus:outline-none';

export function MenuBrowser({ vendors }: { vendors: Vendor[] }) {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceBucket, setPriceBucket] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrepMinutes, setMaxPrepMinutes] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return vendors.filter((vendor) => {
      if (q) {
        const matchesSearch =
          vendor.name.toLowerCase().includes(q) ||
          vendor.meals.some(
            (meal) =>
              meal.name.toLowerCase().includes(q) ||
              (meal.description ?? '').toLowerCase().includes(q),
          );
        if (!matchesSearch) return false;
      }

      if (cuisine && !vendor.cuisines?.includes(cuisine)) return false;

      if (priceBucket) {
        const price = cheapestPrice(vendor);
        const bucket = PRICE_BUCKETS.find((b) => b.value === priceBucket);
        if (price === null || !bucket?.test(price)) return false;
      }

      if (minRating) {
        const bucket = RATING_BUCKETS.find((b) => b.value === minRating);
        if (!vendor.ratingAverage || vendor.ratingAverage < (bucket?.min ?? 0)) return false;
      }

      if (maxPrepMinutes) {
        if (
          vendor.estimatedPrepMinutes == null ||
          vendor.estimatedPrepMinutes > Number(maxPrepMinutes)
        )
          return false;
      }

      return true;
    });
  }, [vendors, query, cuisine, priceBucket, minRating, maxPrepMinutes]);

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

      <div className="mt-4 flex flex-wrap gap-2.5">
        <select
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className={selectClass}
        >
          <option value="">All cuisines</option>
          {CUISINE_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={priceBucket}
          onChange={(e) => setPriceBucket(e.target.value)}
          className={selectClass}
        >
          <option value="">Any price</option>
          {PRICE_BUCKETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className={selectClass}
        >
          <option value="">Any rating</option>
          {RATING_BUCKETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <select
          value={maxPrepMinutes}
          onChange={(e) => setMaxPrepMinutes(e.target.value)}
          className={selectClass}
        >
          <option value="">Any delivery time</option>
          {PREP_TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {vendors.length === 0 && (
          <p className="border-t border-line py-12 text-muted">
            No vendors are live yet — check back soon.
          </p>
        )}

        {vendors.length > 0 && filtered.length === 0 && (
          <p className="border-t border-line py-12 text-muted">
            {query
              ? <>No vendors or meals match &ldquo;{query}&rdquo;.</>
              : 'No vendors match these filters.'}
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
