'use client';

import { useCart } from '@/app/menu/cart-context';
import { useCartTotals } from '@/lib/use-cart-totals';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/** Persistent bottom bar, mobile only — keeps the running total visible while browsing instead
 * of making users open the drawer to check what they've accumulated so far. Desktop already has
 * the header's "Basket (N)" button for this, so it stays hidden there (sm:hidden). */
export function MobileBasketBar() {
  const { count, openDrawer, isDrawerOpen } = useCart();
  const { total } = useCartTotals();

  if (count === 0 || isDrawerOpen) return null;

  return (
    <button
      onClick={openDrawer}
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 bg-paprika px-5 py-4 text-ink shadow-[0_-4px_16px_rgba(0,0,0,0.25)] sm:hidden"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/15 font-mono text-[13px] font-bold">
        {count}
      </span>
      <span className="flex-1 text-left font-mono text-[13.5px] font-bold">View basket</span>
      <span className="font-mono text-[15px] font-bold">{naira(total)}</span>
    </button>
  );
}
