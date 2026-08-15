'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Badge, Vendor } from '@/lib/types';
import { MultiSelectDropdown } from '@/components/multi-select-dropdown';
import {
  CERTIFIED_BADGE_ID,
  CUISINE_OPTIONS,
  DELIVERY_TIME_BUCKETS,
  DIETARY_TAGS,
  PRICE_BUCKETS,
  RATING_BUCKETS,
  formatRatingCount,
  getDeliveryTimeBucket,
  getEstimatedDeliveryMinutes,
} from '@/lib/vendor-options';

const GRADIENTS = [
  'from-paprika/70 to-bg',
  'from-frost/60 to-bg',
  'from-paprika-dim/70 to-bg-alt',
];

const selectClass =
  'rounded-[3px] border border-line bg-bg-alt px-3 py-2.5 text-[13.5px] text-paper focus:border-frost focus:outline-none';

export function MenuBrowser({
  vendors,
  badges,
  priorityArea,
}: {
  vendors: Vendor[];
  badges: Badge[];
  /** Local government picked on the homepage's coverage-check gate (see hero-city-picker.tsx) —
   * matching kitchens are sorted first rather than filtered exclusively, since we don't have real
   * geo-distance data, just a text match against `vendor.area` ("Ogba, Lagos" etc). */
  priorityArea?: string;
}) {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceBucket, setPriceBucket] = useState('');
  const [minRating, setMinRating] = useState('');
  const [deliveryTimeBucket, setDeliveryTimeBucket] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);

  const certificationOptions = [
    { id: CERTIFIED_BADGE_ID, label: 'Certified' },
    ...badges.map((b) => ({ id: b.id, label: b.label })),
  ];

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
        const bucket = PRICE_BUCKETS.find((b) => b.value === priceBucket);
        const hasMatchingItem = vendor.meals.some((meal) => bucket?.test(meal.price));
        if (!hasMatchingItem) return false;
      }

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

      if (certifications.length > 0) {
        const vendorBadgeIds = new Set(vendor.badges?.map((b) => b.id) ?? []);
        const matchesAny = certifications.some((id) =>
          id === CERTIFIED_BADGE_ID ? Boolean(vendor.certifiedAt) : vendorBadgeIds.has(id),
        );
        if (!matchesAny) return false;
      }

      if (dietaryTags.length > 0) {
        const hasAny = vendor.meals.some((meal) =>
          dietaryTags.some((tag) => meal.dietaryTags?.includes(tag)),
        );
        if (!hasAny) return false;
      }

      return true;
    });
  }, [
    vendors,
    query,
    cuisine,
    priceBucket,
    minRating,
    deliveryTimeBucket,
    certifications,
    dietaryTags,
  ]);

  const sorted = useMemo(() => {
    if (!priorityArea) return filtered;
    const matchesArea = (vendor: Vendor) =>
      (vendor.area ?? '').toLowerCase().startsWith(priorityArea.toLowerCase());
    // Stable sort — ties (both match, or both don't) keep their existing relative order.
    return [...filtered].sort((a, b) => Number(matchesArea(b)) - Number(matchesArea(a)));
  }, [filtered, priorityArea]);

  const nearbyCount = priorityArea
    ? sorted.filter((v) => (v.area ?? '').toLowerCase().startsWith(priorityArea.toLowerCase()))
        .length
    : 0;

  return (
    <>
      <div className="mt-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search kitchens or meals — e.g. Jollof Rice, Egusi Soup"
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
        <MultiSelectDropdown
          label="Any certification"
          options={certificationOptions.map((b) => ({ value: b.id, label: b.label }))}
          selected={certifications}
          onChange={setCertifications}
        />
        <MultiSelectDropdown
          label="Any dietary requirement"
          options={DIETARY_TAGS.map((tag) => ({ value: tag, label: tag }))}
          selected={dietaryTags}
          onChange={setDietaryTags}
        />
      </div>

      <div className="mt-8">
        {vendors.length === 0 && (
          <p className="border-t border-line py-12 text-muted">
            No kitchens are live yet — check back soon.
          </p>
        )}

        {vendors.length > 0 && sorted.length === 0 && (
          <p className="border-t border-line py-12 text-muted">
            {query
              ? <>No kitchens or meals match &ldquo;{query}&rdquo;.</>
              : 'No kitchens match these filters.'}
          </p>
        )}

        {priorityArea && sorted.length > 0 && (
          <p className="border-t border-line py-4 font-mono text-xs text-frost">
            {nearbyCount > 0
              ? `Showing kitchens near ${priorityArea} first`
              : `No kitchens in ${priorityArea} yet — showing all kitchens`}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((vendor, vi) => {
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
                  {(vendor.certifiedAt || (vendor.badges && vendor.badges.length > 0)) && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {vendor.certifiedAt && (
                        <span className="rounded-full bg-frost/15 px-2.5 py-0.5 font-mono text-[10.5px] text-frost">
                          Certified
                        </span>
                      )}
                      {vendor.badges?.map((b) => (
                        <span
                          key={b.id}
                          className="rounded-full bg-paprika/15 px-2.5 py-0.5 font-mono text-[10.5px] text-paprika"
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3 text-[13px] text-muted">
                    <span>
                      {mealCount} {mealCount === 1 ? 'meal' : 'meals'}
                    </span>
                    {vendor.ratingCount ? (
                      <span className="text-paprika">
                        ★ {vendor.ratingAverage?.toFixed(1)} ({formatRatingCount(vendor.ratingCount)})
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
