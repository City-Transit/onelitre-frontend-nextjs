'use client';

import { useCart } from './cart-context';
import type { MealSize } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function QtyStepper({ size, vendorId }: { size: MealSize; vendorId: string }) {
  const { cart, setQty } = useCart();
  const qty = cart[size.id] ?? 0;

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-line px-1 py-1 font-mono text-[14px] font-semibold text-paper"
      title={size.note ?? undefined}
    >
      <span className="pl-2">
        {size.litres}L <span className="text-frost">· {size.servings} meals</span>{' '}
        <span className="text-paprika">· {naira(size.price)}</span>
      </span>
      {qty === 0 ? (
        <button
          onClick={() => setQty(size.id, 1, vendorId)}
          className="rounded-full bg-paprika px-2.5 py-1 font-bold text-ink"
        >
          +
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQty(size.id, qty - 1, vendorId)}
            className="h-6 w-6 rounded-full border border-line"
          >
            −
          </button>
          <span className="w-4 text-center">{qty}</span>
          <button
            onClick={() => setQty(size.id, qty + 1, vendorId)}
            className="h-6 w-6 rounded-full border border-line"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
