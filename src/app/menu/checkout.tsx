'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { useCart } from './cart-context';
import { COMING_SOON_CITIES, LAGOS_AREAS, LIVE_CITY } from '@/lib/locations';
import type { Vendor } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const TIME_SLOTS = ['9am-11am', '11am-1pm', '1pm-3pm', '3pm-5pm', '5pm-7pm'];

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-3 text-[15px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

export function Checkout({ vendors }: { vendors: Vendor[] }) {
  const router = useRouter();
  const { cart, count } = useCart();
  const [city, setCity] = useState(LIVE_CITY);
  const [area, setArea] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizesById = new Map(
    vendors.flatMap((v) => v.meals.flatMap((m) => m.sizes.map((s) => [s.id, { size: s, meal: m }] as const))),
  );

  const lines = Object.entries(cart)
    .map(([mealSizeId, quantity]) => {
      const entry = sizesById.get(mealSizeId);
      if (!entry) return null;
      return { mealSizeId, quantity, meal: entry.meal, size: entry.size };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const total = lines.reduce((sum, line) => sum + line.size.price * line.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { authorizationUrl }: { authorizationUrl: string } = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          deliveryAddress,
          deliveryArea: `${area}, ${city}`,
          deliveryDate,
          deliveryTimeSlot,
          notes: notes || undefined,
          items: lines.map((l) => ({ mealSizeId: l.mealSizeId, quantity: l.quantity })),
        }),
      });
      // Cart clears once payment actually succeeds (see the callback page) — not here, since
      // the customer could still abandon the Paystack page without paying.
      window.location.assign(authorizationUrl);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
        return;
      }
      setError('Something went wrong placing your order. Please try again.');
      setSubmitting(false);
    }
  }

  if (count === 0) return null;

  return (
    <section id="checkout" className="scroll-mt-24 bg-paper px-6 py-16 text-ink">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-semibold">Your order</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[16px] border border-[rgba(18,33,29,0.14)] p-5">
            {lines.map((line) => (
              <div key={line.mealSizeId} className="flex justify-between py-2 text-sm">
                <span>
                  {line.meal.name} — {line.size.litres}L ({line.size.servings} meals) ×{' '}
                  {line.quantity}
                </span>
                <span>{naira(line.size.price * line.quantity)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-[rgba(18,33,29,0.14)] pt-3 font-semibold">
              <span>Total</span>
              <span>{naira(total)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold">City</label>
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`${inputClass} mt-1`}
                >
                  <option value={LIVE_CITY}>{LIVE_CITY}</option>
                  {COMING_SOON_CITIES.map((c) => (
                    <option key={c} value={c} disabled>
                      {c} — coming soon
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Area</label>
                <select
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`${inputClass} mt-1`}
                >
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
            <div>
              <label className="text-sm font-semibold">Street address</label>
              <textarea
                required
                rows={2}
                placeholder="12 Admiralty Way, off Ligali Ayorinde"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Delivery date</label>
              <input
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Delivery time</label>
              <select
                required
                value={deliveryTimeSlot}
                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                className={`${inputClass} mt-1`}
              >
                <option value="" disabled>
                  Select a time slot
                </option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Notes (optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-paprika-dim px-5 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
            >
              {submitting ? 'Redirecting to payment…' : 'Place order & pay'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
