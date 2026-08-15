'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useCart } from '@/app/menu/cart-context';
import type { Vendor } from '@/lib/types';

/** Shared by the cart drawer and the mobile sticky basket bar so both show the same running
 * total without fetching the vendor twice. Fetches whenever the cart has items (not just when
 * a UI surface displaying the total happens to be open), so the total stays live everywhere. */
export function useCartTotals() {
  const { cart, vendorId, count, prune } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vendorId) {
      setVendor(null);
      return;
    }
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
  }, [vendorId, prune]);

  const lines = vendor
    ? vendor.meals
        .filter((item) => (cart[item.id] ?? 0) > 0)
        .map((item) => ({ item, quantity: cart[item.id] }))
    : [];

  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const mealsCovered = lines.reduce((sum, line) => sum + line.item.servings * line.quantity, 0);

  return { vendor, lines, total, mealsCovered, loading, count };
}
