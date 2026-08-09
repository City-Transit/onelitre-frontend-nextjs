'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COMING_SOON_CITIES, LAGOS_AREAS, LIVE_CITY } from '@/lib/locations';

const selectClass =
  'rounded-[3px] border border-line bg-bg-alt px-4 py-3.5 font-mono text-[13.5px] text-paper focus:border-frost focus:outline-none';

/** Coverage-check gate — this is a launch-in-one-city product, so the homepage's primary CTA
 * leads with "are we in your area?" rather than a generic sign-up button. Log in stays reachable
 * from the site header, unaffected by this. */
export function HeroCityPicker() {
  const [city, setCity] = useState(LIVE_CITY);
  const [area, setArea] = useState('');

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
          onChange={(e) => setArea(e.target.value)}
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

      {area ? (
        <Link
          href="/register"
          className="mt-4 inline-flex items-center gap-2.5 rounded-[3px] bg-paprika px-6 py-4 font-mono text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#EA8A3E]"
        >
          Create your account
        </Link>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Pick your local government above to get started.
        </p>
      )}
    </div>
  );
}
