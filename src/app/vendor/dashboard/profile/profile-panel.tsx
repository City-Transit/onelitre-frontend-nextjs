'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { COMING_SOON_CITIES, LAGOS_AREAS, LIVE_CITY } from '@/lib/locations';
import { CUISINE_OPTIONS, PREP_TIME_OPTIONS } from '@/lib/vendor-options';
import type { Vendor } from '@/lib/types';

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2.5 text-[14px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

function parseArea(area?: string | null): { area: string; city: string } {
  if (!area) return { area: '', city: LIVE_CITY };
  const [areaPart, cityPart] = area.split(', ');
  return { area: areaPart ?? '', city: cityPart ?? LIVE_CITY };
}

export function ProfilePanel({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const parsed = parseArea(vendor.area);
  const [city, setCity] = useState(parsed.city);
  const [area, setArea] = useState(parsed.area);
  const [address, setAddress] = useState(vendor.address ?? '');
  const [contactPhone, setContactPhone] = useState(vendor.contactPhone ?? '');
  const [isRegisteredBusiness, setIsRegisteredBusiness] = useState<'yes' | 'no'>(
    vendor.isRegisteredBusiness ? 'yes' : 'no',
  );
  const [registrationNumber, setRegistrationNumber] = useState(
    vendor.registrationNumber ?? '',
  );
  const [cuisines, setCuisines] = useState<string[]>(vendor.cuisines ?? []);
  const [estimatedPrepMinutes, setEstimatedPrepMinutes] = useState(
    vendor.estimatedPrepMinutes ? String(vendor.estimatedPrepMinutes) : '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleCuisine(c: string) {
    setCuisines((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      await apiFetch('/vendor/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          area: area ? `${area}, ${city}` : undefined,
          address: address || undefined,
          contactPhone: contactPhone || undefined,
          isRegisteredBusiness: isRegisteredBusiness === 'yes',
          registrationNumber:
            isRegisteredBusiness === 'yes' ? registrationNumber || undefined : undefined,
          cuisines,
          estimatedPrepMinutes: estimatedPrepMinutes
            ? Number(estimatedPrepMinutes)
            : undefined,
        }),
      });
      setSaved(true);
      router.refresh();
    } catch {
      setError('Something went wrong saving your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
            <option value={LIVE_CITY}>{LIVE_CITY}</option>
            {COMING_SOON_CITIES.map((c) => (
              <option key={c} value={c} disabled>
                {c} — coming soon
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Area</label>
          <select value={area} onChange={(e) => setArea(e.target.value)} className={inputClass}>
            <option value="" disabled>
              Select an area
            </option>
            {LAGOS_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Kitchen address</label>
        <input
          placeholder="12 Admiralty Way"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Business phone</label>
        <input
          type="tel"
          placeholder="0801 234 5678"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Cuisine (select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((c) => {
            const active = cuisines.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCuisine(c)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-[rgba(18,33,29,0.14)] bg-paper-dim text-ink'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Typical prep time</label>
        <select
          value={estimatedPrepMinutes}
          onChange={(e) => setEstimatedPrepMinutes(e.target.value)}
          className={inputClass}
        >
          <option value="">Select prep time</option>
          {PREP_TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Is your business registered?</label>
        <select
          value={isRegisteredBusiness}
          onChange={(e) => setIsRegisteredBusiness(e.target.value as 'yes' | 'no')}
          className={inputClass}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      {isRegisteredBusiness === 'yes' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Registration number (CAC/BN)</label>
          <input
            placeholder="RC1234567"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && !error && <p className="text-sm text-green-700">Profile saved.</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 self-start rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
      >
        {submitting ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
