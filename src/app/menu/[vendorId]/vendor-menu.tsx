'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { QtyStepper } from '../qty-stepper';
import { VendorBasketPanel } from './vendor-basket-panel';
import { MultiSelectDropdown } from '@/components/multi-select-dropdown';
import { CUISINE_OPTIONS, DIETARY_TAGS, PRICE_BUCKETS } from '@/lib/vendor-options';
import type { Vendor } from '@/lib/types';

const selectClass =
  'rounded-[3px] border border-line bg-bg-alt px-3 py-2.5 text-[13.5px] text-paper focus:border-frost focus:outline-none';

export function VendorMenu({ vendor }: { vendor: Vendor }) {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [priceBucket, setPriceBucket] = useState('');
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);

  // Rating/delivery-time/certification are kitchen-level — since this page is already scoped to
  // one vendor, filtering by them here could only ever hide-or-show the whole menu, never narrow
  // it (that's what the browse page's filters are for). Cuisine is also vendor-level but kept
  // here since a customer landing directly on this page (e.g. a shared link) may still want the
  // quick "does this match what I'm after" check. Search, price, and dietary tag filter the
  // individual items themselves.
  const vendorMatchesFilters = useMemo(() => {
    if (cuisine && !vendor.cuisines?.includes(cuisine)) return false;
    return true;
  }, [vendor, cuisine]);

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

      if (dietaryTags.length > 0 && !dietaryTags.some((tag) => meal.dietaryTags?.includes(tag))) {
        return false;
      }

      return true;
    });
  }, [vendor.meals, vendorMatchesFilters, query, priceBucket, dietaryTags]);

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
          <MultiSelectDropdown
            label="Any dietary requirement"
            options={DIETARY_TAGS.map((tag) => ({ value: tag, label: tag }))}
            selected={dietaryTags}
            onChange={setDietaryTags}
          />
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                {meal.dietaryTags && meal.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {meal.dietaryTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-frost/15 px-2.5 py-0.5 font-mono text-[10.5px] text-frost"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
                : "This kitchen doesn't match the selected filters."}
            </p>
          )}
        </div>
      </div>

      <VendorBasketPanel vendor={vendor} />
    </div>
  );
}
