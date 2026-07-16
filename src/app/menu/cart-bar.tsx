'use client';

import { useCart } from './cart-context';
import type { Vendor } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function CartBar({ vendors }: { vendors: Vendor[] }) {
  const { cart, count } = useCart();

  if (count === 0) return null;

  const total = vendors
    .flatMap((v) => v.meals)
    .flatMap((m) => m.sizes)
    .reduce((sum, size) => sum + (cart[size.id] ?? 0) * size.price, 0);

  return (
    <div className="sticky bottom-0 z-50 border-t border-line bg-ink px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div>
          <div className="font-mono text-[13px] text-muted">
            {count} {count === 1 ? 'item' : 'items'}
          </div>
          <div className="font-serif text-xl font-semibold text-paper">{naira(total)}</div>
        </div>
        <a
          href="#checkout"
          className="rounded-[3px] bg-paprika px-5 py-3 font-mono text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#EA8A3E]"
        >
          Checkout →
        </a>
      </div>
    </div>
  );
}
