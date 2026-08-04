'use client';

import { useCart } from '@/app/menu/cart-context';
import { useSavingsBenchmark } from '@/lib/use-savings-benchmark';
import { computeSavings } from '@/lib/savings';
import type { MealSize } from '@/lib/types';

const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;

/** Live, basket-driven — reinforces the savings pitch right where the customer is actually
 * deciding what to add, not just once on the homepage. `meals` is this vendor's own item list
 * (already loaded server-side), so no extra fetch is needed here. */
export function BasketSavingsBanner({ meals }: { meals: MealSize[] }) {
  const { cart } = useCart();
  const benchmark = useSavingsBenchmark();

  const itemsById = new Map(meals.map((item) => [item.id, item]));
  let mealsCovered = 0;
  let onelitreCost = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const item = itemsById.get(id);
    if (!item) continue;
    mealsCovered += item.servings * qty;
    onelitreCost += item.price * qty;
  }

  if (!benchmark || mealsCovered === 0) return null;
  const result = computeSavings(mealsCovered, onelitreCost, benchmark);
  if (result.savings <= 0) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-frost/30 bg-frost/10 px-5 py-4">
      <div className="text-sm text-paper">
        Your order covers <span className="font-semibold text-frost">{mealsCovered}</span>{' '}
        {mealsCovered === 1 ? 'meal' : 'meals'} — that would run ~
        {naira(result.restaurantEquivalentCost)} via typical delivery apps.
      </div>
      <div className="font-mono text-sm text-paprika">
        You&apos;re saving {naira(result.savings)} ({Math.round(result.pctSaved * 100)}%)
      </div>
    </div>
  );
}
