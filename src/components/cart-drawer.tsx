'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useCart } from '@/app/menu/cart-context';
import { useSavingsBenchmark } from '@/lib/use-savings-benchmark';
import { computeSavings } from '@/lib/savings';
import type { Vendor } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function CartDrawer() {
  const { cart, vendorId, count, isDrawerOpen, closeDrawer, setQty, prune } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const benchmark = useSavingsBenchmark();

  useEffect(() => {
    if (!isDrawerOpen || !vendorId) return;
    let cancelled = false;

    async function loadVendor() {
      setLoading(true);
      try {
        const v: Vendor = await apiFetch(`/vendors/${vendorId}`);
        if (cancelled) return;
        setVendor(v);
        prune(new Set(v.meals.map((item) => item.id)));
      } catch {
        if (!cancelled) setVendor(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadVendor();

    return () => {
      cancelled = true;
    };
  }, [isDrawerOpen, vendorId, prune]);

  if (!isDrawerOpen) return null;

  const lines = vendor
    ? vendor.meals
        .filter((item) => (cart[item.id] ?? 0) > 0)
        .map((item) => ({ item, quantity: cart[item.id] }))
    : [];

  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const mealsCovered = lines.reduce((sum, line) => sum + line.item.servings * line.quantity, 0);
  const savingsResult = benchmark ? computeSavings(mealsCovered, total, benchmark) : null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        aria-label="Close basket"
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-bg-alt shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-lg text-paper">Your basket</h2>
          <button
            aria-label="Close basket"
            onClick={closeDrawer}
            className="font-mono text-sm text-muted transition-colors hover:text-frost"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && <p className="text-sm text-muted">Loading your basket…</p>}
          {!loading && count === 0 && (
            <p className="text-sm text-muted">Your basket is empty.</p>
          )}
          {!loading &&
            lines.map((line) => (
              <div
                key={line.item.id}
                className="flex items-center justify-between gap-3 border-b border-line/50 py-3 text-sm last:border-b-0"
              >
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
                    onClick={() =>
                      vendorId && setQty(line.item.id, line.quantity - 1, vendorId)
                    }
                    className="h-6 w-6 rounded-full border border-line text-paper"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-paper">{line.quantity}</span>
                  <button
                    aria-label={`Increase ${line.item.name} quantity`}
                    onClick={() =>
                      vendorId && setQty(line.item.id, line.quantity + 1, vendorId)
                    }
                    className="h-6 w-6 rounded-full border border-line text-paper"
                  >
                    +
                  </button>
                  <button
                    aria-label={`Remove ${line.item.name} from basket`}
                    onClick={() => vendorId && setQty(line.item.id, 0, vendorId)}
                    className="ml-1 font-mono text-xs text-muted transition-colors hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
        </div>

        {count > 0 && (
          <div className="border-t border-line px-6 py-5">
            {savingsResult && savingsResult.savings > 0 && (
              <div className="mb-3 font-mono text-xs text-frost">
                ≈ {mealsCovered} {mealsCovered === 1 ? 'meal' : 'meals'} · save{' '}
                {naira(savingsResult.savings)} vs. delivery apps
              </div>
            )}
            <div className="mb-4 flex justify-between font-serif text-lg text-paper">
              <span>Total</span>
              <span>{naira(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block rounded-[3px] bg-paprika px-5 py-3 text-center font-mono text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#EA8A3E]"
            >
              Go to checkout →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
