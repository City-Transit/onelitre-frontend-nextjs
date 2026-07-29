'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useCart } from '@/app/menu/cart-context';
import type { Vendor } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function CartDrawer() {
  const { cart, vendorId, count, isDrawerOpen, closeDrawer } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen || !vendorId) return;
    let cancelled = false;

    async function loadVendor() {
      setLoading(true);
      try {
        const v: Vendor = await apiFetch(`/vendors/${vendorId}`);
        if (!cancelled) setVendor(v);
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
  }, [isDrawerOpen, vendorId]);

  if (!isDrawerOpen) return null;

  const lines = vendor
    ? vendor.meals
        .flatMap((meal) => meal.sizes.map((size) => ({ meal, size })))
        .filter(({ size }) => (cart[size.id] ?? 0) > 0)
        .map(({ meal, size }) => ({ meal, size, quantity: cart[size.id] }))
    : [];

  const total = lines.reduce((sum, line) => sum + line.size.price * line.quantity, 0);

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
              <div key={line.size.id} className="flex justify-between gap-3 py-2.5 text-sm">
                <span className="text-paper">
                  {line.meal.name} — {line.size.litres}L × {line.quantity}
                </span>
                <span className="whitespace-nowrap text-muted">
                  {naira(line.size.price * line.quantity)}
                </span>
              </div>
            ))}
        </div>

        {count > 0 && (
          <div className="border-t border-line px-6 py-5">
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
