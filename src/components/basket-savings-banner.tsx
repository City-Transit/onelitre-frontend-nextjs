'use client';

import { useCart } from '@/app/menu/cart-context';
import type { MealSize } from '@/lib/types';

/** Live, basket-driven — shows what's accumulating right where the customer is actually
 * deciding what to add, not just once on the homepage. `meals` is this vendor's own item list
 * (already loaded server-side), so no extra fetch is needed here. */
export function BasketSavingsBanner({ meals }: { meals: MealSize[] }) {
  const { cart } = useCart();

  const itemsById = new Map(meals.map((item) => [item.id, item]));
  let mealsCovered = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const item = itemsById.get(id);
    if (!item) continue;
    mealsCovered += item.servings * qty;
  }

  if (mealsCovered === 0) return null;

  return (
    <div className="mt-6 flex items-center gap-3 rounded-[3px] border border-frost/30 bg-frost/10 px-5 py-4">
      <div className="text-sm text-paper">
        Your order covers <span className="font-semibold text-frost">{mealsCovered}</span>{' '}
        {mealsCovered === 1 ? 'meal' : 'meals'}.
      </div>
    </div>
  );
}
