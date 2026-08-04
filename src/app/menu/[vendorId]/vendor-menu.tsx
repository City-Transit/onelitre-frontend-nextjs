'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { QtyStepper } from '../qty-stepper';
import { VendorBasketPanel } from './vendor-basket-panel';
import {
  CERTIFIED_BADGE_ID,
  CUISINE_OPTIONS,
  DELIVERY_TIME_BUCKETS,
  PRICE_BUCKETS,
  RATING_BUCKETS,
  getDeliveryTimeBucket,
  getEstimatedDeliveryMinutes,
} from '@/lib/vendor-options';
import type { Badge, Vendor } from '@/lib/types';

const selectClass =
  'rounded-[3px] border border-line bg-bg-alt px-3 py-2.5 text-[13.5px] text-paper focus:border-frost focus:outline-none';

export function VendorMenu({ vendor, badges }: { vendor: Vendor; badges: Badge[] }) {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceBucket, setPriceBucket] = useState('');
  const [minRating, setMinRating] = useState('');
  const [deliveryTimeBucket, setDeliveryTimeBucket] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const badgeFilterOptions = [
    { id: CERTIFIED_BADGE_ID, label: 'Certified' },
    ...badges.map((b) => ({ id: b.id, label: b.label })),
  ];

  function toggleBadge(id: string) {
    setSelectedBadges((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  // Cuisine/rating/delivery-time/badges are vendor-level, not per-item — since this page is
  // already scoped to one vendor, they can only ever hide or keep the whole menu, not narrow it
  // further. Only search and price filter the individual items themselves.
  const vendorMatchesFilters = useMemo(() => {
    if (cuisine && !vendor.cuisines?.includes(cuisine)) return false;

    if (minRating) {
      const bucket = RATING_BUCKETS.find((b) => b.value === minRating);
      if (!vendor.ratingAverage || vendor.ratingAverage < (bucket?.min ?? 0)) return false;
    }

    if (deliveryTimeBucket) {
      const totalMinutes = getEstimatedDeliveryMinutes(vendor);
      const vendorBucket = totalMinutes == null ? null : getDeliveryTimeBucket(totalMinutes);
      const selectedRank = DELIVERY_TIME_BUCKETS.findIndex((b) => b.value === deliveryTimeBucket);
      const vendorRank = vendorBucket
        ? DELIVERY_TIME_BUCKETS.findIndex((b) => b.value === vendorBucket.value)
        : -1;
      if (vendorRank === -1 || vendorRank > selectedRank) return false;
    }

    if (selectedBadges.length > 0) {
      const vendorBadgeIds = new Set(vendor.badges?.map((b) => b.id) ?? []);
      const matchesAny = selectedBadges.some((id) =>
        id === CERTIFIED_BADGE_ID ? Boolean(vendor.certifiedAt) : vendorBadgeIds.has(id),
      );
      if (!matchesAny) return false;
    }

    return true;
  }, [vendor, cuisine, minRating, deliveryTimeBucket, selectedBadges]);

  const filteredMeals = useMemo(() => {
    if (!vendorMatchesFilters) return [];
    const q = query.trim().toLowerCase();

    return vendor.meals.filter((meal) => {
      if (q) {
        const matchesSearch =
          meal.name.toLowerCase().includes(q) ||
          (meal.description ?? '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (priceBucket) {
        const bucket = PRICE_BUCKETS.find((b) => b.value === priceBucket);
        if (!bucket?.test(meal.price)) return false;
      }

      return true;
    });
  }, [vendor.meals, vendorMatchesFilters, query, priceBucket]);

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${vendor.name}'s menu`}
          className="w-full max-w-md rounded-[3px] border border-line bg-bg-alt px-4 py-3 text-[14px] text-paper placeholder:text-muted focus:border-frost focus:outline-none"
        />

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
            value={deliveryTimeBucket}
            onChange={(e) => setDeliveryTimeBucket(e.target.value)}
            className={selectClass}
          >
            <option value="">Any delivery time</option>
            {DELIVERY_TIME_BUCKETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {badgeFilterOptions.map((b) => {
            const active = selectedBadges.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBadge(b.id)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1.5 font-mono text-[12px] transition-colors ${
                  active
                    ? 'border-frost bg-frost text-bg'
                    : 'border-line bg-bg-alt text-muted hover:text-paper'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {filteredMeals.map((meal, mi) => (
            <div
              key={meal.id}
              className="flex flex-col overflow-hidden rounded-lg border border-line bg-bg-alt"
            >
              <div className="relative aspect-[4/3]">
                {meal.imageUrl ? (
                  <Image
                    src={meal.imageUrl}
                    alt={meal.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    priority={mi === 0}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-paprika/70 to-bg text-4xl">
                    🍲
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-lg leading-snug text-paper">{meal.name}</h3>
                {meal.description && (
                  <p className="text-[13px] leading-relaxed text-muted">{meal.description}</p>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <QtyStepper size={meal} vendorId={vendor.id} />
                </div>
              </div>
            </div>
          ))}
          {filteredMeals.length === 0 && (
            <p className="text-sm text-muted">
              {vendorMatchesFilters
                ? `No items match ${query ? `"${query}"` : 'these filters'}.`
                : "This vendor doesn't match the selected filters."}
            </p>
          )}
        </div>
      </div>

      <VendorBasketPanel vendor={vendor} />
    </div>
  );
}
