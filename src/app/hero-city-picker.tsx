'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COMING_SOON_CITIES, LAGOS_AREAS, LIVE_CITY } from '@/lib/locations';

const selectClass =
  'rounded-[3px] border border-line bg-bg-alt px-4 py-3.5 font-mono text-[13.5px] text-paper focus:border-frost focus:outline-none';

/** Coverage-check gate — this is a launch-in-one-city product, so the homepage's primary CTA
 * leads with "are we in your area?" rather than a generic sign-up button. Picking a local
 * government takes the visitor straight to the kitchen list (kitchens near that area sorted
 * first — see menu-browser.tsx), no extra click needed. Log in/sign up stay reachable from the
 * site header regardless. */
export function HeroCityPicker() {
  const router = useRouter();
  const [city, setCity] = useState(LIVE_CITY);
  const [area, setArea] = useState('');

  function handleAreaChange(value: string) {
    setArea(value);
    if (value) {
      router.push(`/menu?area=${encodeURIComponent(value)}`);
    }
  }

  return (
    <div className="mt-9">
      <div className="grid max-w-[420px] grid-cols-2 gap-3">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={selectClass}
        >
          <option value={LIVE_CITY}>{LIVE_CITY}</option>
          {COMING_SOON_CITIES.map((c) => (
            <option key={c} value={c} disabled>
              {c} — coming soon
            </option>
          ))}
        </select>
        <select
          value={area}
          onChange={(e) => handleAreaChange(e.target.value)}
          className={selectClass}
        >
          <option value="" disabled>
            Select your local government
          </option>
          {LAGOS_AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-muted">
        Pick your local government above to see kitchens near you.
      </p>
    </div>
  );
}
