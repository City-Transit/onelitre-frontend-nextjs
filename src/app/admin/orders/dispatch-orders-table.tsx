'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Order } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const STATUS_LABEL: Record<string, string> = {
  placed: 'Placed',
  ready_for_delivery: 'Ready for delivery',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function DispatchOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(orderId: string, status: 'out_for_delivery' | 'delivered' | 'cancelled') {
    setBusyId(orderId);
    await apiFetch(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    setBusyId(null);
  }

  if (orders.length === 0) {
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
            <th className="px-6 py-4">Delivery address</th>
            <th className="px-6 py-4">Date / time</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-[rgba(18,33,29,0.1)]">
              <td className="px-6 py-4 whitespace-nowrap text-[#5B6B63]">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">{order.deliveryAddress}</td>
              <td className="px-6 py-4 text-[#5B6B63] whitespace-nowrap">
                {order.deliveryDate} · {order.deliveryTimeSlot}
              </td>
              <td className="px-6 py-4 font-semibold whitespace-nowrap">
                {naira(order.subtotal)}
              </td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold">
                  {STATUS_LABEL[order.status]}
                </span>
              </td>
              <td className="px-6 py-4">
                {order.status === 'ready_for_delivery' ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setStatus(order.id, 'out_for_delivery')}
                      disabled={busyId === order.id}
                      className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                    >
                      Out for delivery
                    </button>
                    <button
                      onClick={() => setStatus(order.id, 'delivered')}
                      disabled={busyId === order.id}
                      className="rounded-full border border-[rgba(18,33,29,0.2)] px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                    >
                      Delivered
                    </button>
                    <button
                      onClick={() => setStatus(order.id, 'cancelled')}
                      disabled={busyId === order.id}
                      className="rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                ) : order.status === 'out_for_delivery' ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setStatus(order.id, 'delivered')}
                      disabled={busyId === order.id}
                      className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                    >
                      Delivered
                    </button>
                  </div>
                ) : (
                  <div className="text-right text-xs text-[#8A8073]">
                    {order.status === 'placed' ? 'Awaiting vendor' : '—'}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
