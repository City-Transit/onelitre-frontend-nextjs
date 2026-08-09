'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import type { SavingsBenchmark } from '@/lib/types';

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-3 text-[15px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

export function SavingsBenchmarkForm({ benchmark }: { benchmark: SavingsBenchmark }) {
  const router = useRouter();
  const [avgPricePerMeal, setAvgPricePerMeal] = useState(String(benchmark.avgPricePerMeal));
  const [avgMealsPerDeliveryOrder, setAvgMealsPerDeliveryOrder] = useState(
    String(benchmark.avgMealsPerDeliveryOrder),
  );
  const [avgDeliveryFeePerOrder, setAvgDeliveryFeePerOrder] = useState(
    String(benchmark.avgDeliveryFeePerOrder),
  );
  const [illustrativeOnelitrePricePerMeal, setIllustrativeOnelitrePricePerMeal] = useState(
    String(benchmark.illustrativeOnelitrePricePerMeal),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch('/admin/savings-benchmark', {
        method: 'PATCH',
        body: JSON.stringify({
          avgPricePerMeal: Number(avgPricePerMeal),
          avgMealsPerDeliveryOrder: Number(avgMealsPerDeliveryOrder),
          avgDeliveryFeePerOrder: Number(avgDeliveryFeePerOrder),
          illustrativeOnelitrePricePerMeal: Number(illustrativeOnelitrePricePerMeal),
        }),
      });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong saving these values. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold">Avg. price per meal (delivery apps)</label>
          <input
            required
            type="number"
            min={0}
            step={1}
            value={avgPricePerMeal}
            onChange={(e) => setAvgPricePerMeal(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Avg. meals per delivery-app order</label>
          <input
            required
            type="number"
            min={1}
            step={1}
            value={avgMealsPerDeliveryOrder}
            onChange={(e) => setAvgMealsPerDeliveryOrder(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Avg. delivery fee per order</label>
          <input
            required
            type="number"
            min={0}
            step={1}
            value={avgDeliveryFeePerOrder}
            onChange={(e) => setAvgDeliveryFeePerOrder(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div>
          <label className="text-sm font-semibold">
            Illustrative Onelitre price per meal
          </label>
          <input
            required
            type="number"
            min={0}
            step={1}
            value={illustrativeOnelitrePricePerMeal}
            onChange={(e) => setIllustrativeOnelitrePricePerMeal(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
      </div>
      <p className="text-xs text-[#8A8073]">
        These drive the savings-calculator messaging shown on the homepage, kitchen menu pages,
        basket, and checkout. The illustrative Onelitre price is only used on the homepage, where
        there&apos;s no real basket yet to compute an actual price from.
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
      >
        {submitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
