'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useCart } from '@/app/menu/cart-context';
import type { DeliveryFee, Vendor } from '@/lib/types';

const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;

/** Platform service fee — keep in sync with SERVICE_FEE_RATE in web/backend orders.service.ts. */
const SERVICE_FEE_RATE = 0.02;

/** Desktop-only persistent basket, live as items are added — mirrors the checkout summary
 * (fees) without waiting for the customer to open the drawer or go to checkout. No delivery
 * area is known yet here, so the delivery fee shown is the lowest currently configured across
 * all areas (in practice a single flat rate today). */
export function VendorBasketPanel({ vendor }: { vendor: Vendor }) {
  const { cart, vendorId, setQty } = useCart();
  const [minDeliveryFee, setMinDeliveryFee] = useState(0);

  useEffect(() => {
    apiFetch('/delivery-fees')
      .then((fees: DeliveryFee[]) => {
        if (fees.length > 0) setMinDeliveryFee(Math.min(...fees.map((f) => f.feeNaira)));
      })
      .catch(() => {});
  }, []);

  const itemsById = new Map(vendor.meals.map((item) => [item.id, item]));
  const lines = Object.entries(cart)
    .map(([id, quantity]) => {
      const item = itemsById.get(id);
      if (!item || quantity <= 0) return null;
      return { item, quantity };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  if (lines.length === 0) {
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-lg border border-line bg-bg-alt p-5">
          <h2 className="font-serif text-lg text-paper">Your basket</h2>
          <div className="mt-10 flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-3xl">🧺</span>
            <p className="text-sm text-muted">Your basket is empty.</p>
          </div>
        </div>
      </aside>
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + minDeliveryFee + serviceFee;
  const mealsCovered = lines.reduce((sum, line) => sum + line.item.servings * line.quantity, 0);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-lg border border-line bg-bg-alt p-5">
        <h2 className="font-serif text-lg text-paper">Your basket</h2>

        <div className="mt-4 flex flex-col gap-3">
          {lines.map((line) => (
            <div key={line.item.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="truncate text-paper">
                  {line.item.name} — {line.item.litres}L
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {naira(line.item.price * line.quantity)}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  aria-label={`Decrease ${line.item.name} quantity`}
                  onClick={() => vendorId && setQty(line.item.id, line.quantity - 1, vendorId)}
                  className="h-6 w-6 rounded-full border border-line text-paper"
                >
                  −
                </button>
                <span className="w-4 text-center text-paper">{line.quantity}</span>
                <button
                  aria-label={`Increase ${line.item.name} quantity`}
                  onClick={() => vendorId && setQty(line.item.id, line.quantity + 1, vendorId)}
                  className="h-6 w-6 rounded-full border border-line text-paper"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{naira(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Delivery fee</span>
            <span>{naira(minDeliveryFee)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Service fee (2%)</span>
            <span>{naira(serviceFee)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-serif text-base text-paper">
            <span>Total</span>
            <span>{naira(total)}</span>
          </div>
        </div>

        {mealsCovered > 0 && (
          <div className="mt-3 rounded-[10px] bg-paprika/10 px-3 py-2.5 text-xs text-paprika-dim">
            This order covers {mealsCovered} {mealsCovered === 1 ? 'meal' : 'meals'}.
          </div>
        )}

        <Link
          href="/checkout"
          className="mt-4 block rounded-[3px] bg-paprika px-5 py-3 text-center font-mono text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#EA8A3E]"
        >
          Go to checkout →
        </Link>
      </div>
    </aside>
  );
}
