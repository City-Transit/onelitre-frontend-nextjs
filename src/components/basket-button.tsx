'use client';

import { useCart } from '@/app/menu/cart-context';

export function BasketButton() {
  const { count, openDrawer } = useCart();

  if (count === 0) return null;

  return (
    <button
      onClick={openDrawer}
      className="rounded-[3px] border border-line px-4 py-2.5 font-mono text-[13px] font-bold text-paper transition-colors hover:border-frost hover:text-frost"
    >
      Basket ({count})
    </button>
  );
}
