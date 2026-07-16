'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { VendorOrderGroup } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function OrdersPanel({ initialGroups }: { initialGroups: VendorOrderGroup[] }) {
  const [groups, setGroups] = useState(initialGroups);
  const [markingId, setMarkingId] = useState<string | null>(null);

  async function markReady(orderId: string) {
    setMarkingId(orderId);
    await apiFetch(`/vendor/orders/${orderId}/ready`, { method: 'PATCH' });
    setGroups((prev) =>
      prev.map((g) =>
        g.order.id === orderId
          ? {
              ...g,
              items: g.items.map((item) => ({ ...item, vendorReadyAt: new Date().toISOString() })),
            }
          : g,
      ),
    );
    setMarkingId(null);
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[20px] bg-paper text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
          <tr>
            <th className="px-6 py-4">Placed</th>
            <th className="px-6 py-4">Delivery</th>
            <th className="px-6 py-4">Items</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ order, items }) => {
            const allReady = items.every((item) => item.vendorReadyAt);
            const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
            return (
              <tr key={order.id} className="border-t border-[rgba(18,33,29,0.1)] align-top">
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-[#5B6B63]">
                  <div>{order.deliveryAddress}</div>
                  <div className="text-xs">{order.deliveryTimeSlot}</div>
                </td>
                <td className="px-6 py-4">
                  <ul className="flex flex-col gap-1">
                    {items.map((item) => (
                      <li key={item.id} className="whitespace-nowrap">
                        {item.mealName} — {item.litres}L × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 font-semibold whitespace-nowrap">{naira(total)}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {allReady ? (
                    <span className="text-xs font-semibold text-[#2f6d4f]">Ready ✓</span>
                  ) : (
                    <button
                      onClick={() => markReady(order.id)}
                      disabled={markingId === order.id}
                      className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
                    >
                      {markingId === order.id ? 'Marking…' : 'Mark ready'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
