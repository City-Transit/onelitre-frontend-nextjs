'use client';

import { useRouter } from 'next/navigation';
import { LIVE_CITY } from '@/lib/locations';

const selectClass =
  'rounded-[3px] border border-line bg-bg-alt px-4 py-3.5 font-mono text-[13.5px] text-paper focus:border-frost focus:outline-none';

/** Coverage-check gate — this is a launch-in-one-city product, so the homepage's primary CTA
 * leads with "are we in your area?" rather than a generic sign-up button. Picking a local
 * government takes the visitor straight to the kitchen list (kitchens near that area sorted
 * first — see menu-browser.tsx), no extra click needed. Log in/sign up stay reachable from the
 * site header regardless.
 *
 * The dropdown only lists `launchedAreas` (from the /delivery-fees isLaunched flag, super-admin-
 * set — see delivery-fees-table.tsx) — every option here is guaranteed deliverable, so picking
 * one always continues straight to the kitchen list rather than risking a dead-end "not live
 * there yet" message on a visitor's first click. */
export function HeroCityPicker({ launchedAreas }: { launchedAreas: string[] }) {
  const router = useRouter();

  function handleAreaChange(value: string) {
    if (value) router.push(`/menu?area=${encodeURIComponent(value)}`);
  }

  return (
    <div className="mt-9">
      <div className="grid max-w-[420px] grid-cols-2 gap-3">
        <select value={LIVE_CITY} disabled className={selectClass}>
          <option value={LIVE_CITY}>{LIVE_CITY}</option>
        </select>
        <select
          defaultValue=""
          onChange={(e) => handleAreaChange(e.target.value)}
          disabled={launchedAreas.length === 0}
          className={selectClass}
        >
          <option value="" disabled>
            Select your local government
          </option>
          {launchedAreas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-muted">
        {launchedAreas.length === 0
          ? "We're launching in Lagos soon — check back shortly."
          : 'Pick your local government above to see kitchens near you.'}
      </p>
    </div>
  );
}
