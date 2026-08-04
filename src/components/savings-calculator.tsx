'use client';

import { useState } from 'react';
import { useSavingsBenchmark } from '@/lib/use-savings-benchmark';
import { computeSavings } from '@/lib/savings';

const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;

/** Homepage-only, manual-input mode — there's no real basket yet at this point in the funnel, so
 * the customer picks a meal count and both sides of the comparison are illustrative. */
export function SavingsCalculator() {
  const benchmark = useSavingsBenchmark();
  const [meals, setMeals] = useState(20);

  const onelitreCost = benchmark ? meals * benchmark.illustrativeOnelitrePricePerMeal : 0;
  const result = benchmark ? computeSavings(meals, onelitreCost, benchmark) : null;

  return (
    <section className="bg-paper px-6 py-24 text-ink">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-[600px]">
          <div className="mb-5 flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-paprika-dim">
            <span className="h-px w-[22px] bg-paprika-dim" />
            The math
          </div>
          <h2 className="text-[clamp(30px,3.4vw,42px)] leading-[1.1] text-ink">
            Daily ordering adds up.
            <br />
            Bulk doesn&apos;t.
          </h2>
        </div>

        <div className="mb-8 max-w-[420px]">
          <label className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.1em] text-[#5B6B63]">
            <span>How many meals a month?</span>
            <span className="text-[15px] font-semibold normal-case tracking-normal text-ink">
              {meals}
            </span>
          </label>
          <input
            type="range"
            min={4}
            max={40}
            step={1}
            value={meals}
            onChange={(e) => setMeals(Number(e.target.value))}
            className="mt-2 w-full accent-paprika"
          />
        </div>

        <div className="grid items-stretch gap-7 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-[3px] bg-bg p-9 text-paper">
            <div className="font-mono text-xs uppercase tracking-[0.1em] opacity-75">
              Ordering single meals
            </div>
            <div className="my-3.5 font-serif text-[52px] font-semibold leading-none">
              {result ? naira(result.restaurantEquivalentCost) : '—'}
            </div>
            <div className="text-sm leading-relaxed opacity-80">
              Per month — {meals} meals at ~{benchmark ? naira(benchmark.avgPricePerMeal) : '—'}{' '}
              each, plus a delivery fee on every order, via typical food-delivery apps.
            </div>
          </div>
          <div className="flex items-center justify-center py-1.5 font-mono text-[13px] text-muted md:py-0">
            VS
          </div>
          <div className="rounded-[3px] bg-paprika p-9 text-ink">
            <div className="font-mono text-xs uppercase tracking-[0.1em] opacity-75">
              One bulk pack from Onelitre.ng
            </div>
            <div className="my-3.5 font-serif text-[52px] font-semibold leading-none">
              {result ? naira(result.onelitreCost) : '—'}
            </div>
            <div className="text-sm leading-relaxed opacity-80">
              Per month — the same {meals} meals, freezer-ready, delivered on your schedule.
            </div>
          </div>
        </div>

        {result && result.savings > 0 && (
          <div className="mt-7 flex flex-wrap items-center gap-4 font-mono text-sm text-paprika-dim">
            <span className="font-serif text-[22px] font-semibold text-ink">
              {naira(result.savings)} saved
            </span>
            <span>
              — that&apos;s {Math.round(result.pctSaved * 100)}% back in your pocket, every
              single month.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
