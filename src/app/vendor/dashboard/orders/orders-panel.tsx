'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { VendorOrderGroup } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

function deadlineLabel(acceptDeadlineAt: string): string {
  const msLeft = new Date(acceptDeadlineAt).getTime() - Date.now();
  if (msLeft <= 0) return 'Overdue';
  const minutes = Math.round(msLeft / 60000);
  return minutes <= 1 ? 'Due now' : `${minutes} min left to accept`;
}

export function OrdersPanel({ initialGroups }: { initialGroups: VendorOrderGroup[] }) {
  const [groups, setGroups] = useState(initialGroups);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  async function acceptOrder(orderId: string) {
    setBusyId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: '' }));
    try {
      await apiFetch(`/vendor/orders/${orderId}/accept`, { method: 'PATCH' });
      setGroups((prev) =>
        prev.map((g) =>
          g.order.id === orderId
            ? {
                ...g,
                items: g.items.map((item) => ({
                  ...item,
                  vendorAcceptedAt: new Date().toISOString(),
                })),
              }
            : g,
        ),
      );
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [orderId]: err instanceof ApiError ? err.message : 'Something went wrong.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function rejectOrder(orderId: string) {
    const reason = reasonById[orderId]?.trim();
    if (!reason) {
      setErrorById((prev) => ({ ...prev, [orderId]: 'A reason is required to reject.' }));
      return;
    }
    setBusyId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: '' }));
    try {
      await apiFetch(`/vendor/orders/${orderId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      setGroups((prev) =>
        prev.map((g) =>
          g.order.id === orderId
            ? {
                ...g,
                items: g.items.map((item) => ({
                  ...item,
                  vendorRejectedAt: new Date().toISOString(),
                  vendorRejectionReason: reason,
                })),
              }
            : g,
        ),
      );
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [orderId]: err instanceof ApiError ? err.message : 'Something went wrong.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function markReady(orderId: string) {
    setBusyId(orderId);
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
    setBusyId(null);
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
            const allAccepted = items.every((item) => item.vendorAcceptedAt);
            const anyRejected = items.some((item) => item.vendorRejectedAt);
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
                  {!allAccepted && !anyRejected && (
                    <div className="mt-1 text-xs text-paprika-dim">
                      {deadlineLabel(items[0].acceptDeadlineAt)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {anyRejected ? (
                    <span className="text-xs font-semibold text-red-700">Rejected</span>
                  ) : allReady ? (
                    <span className="text-xs font-semibold text-[#2f6d4f]">Ready ✓</span>
                  ) : allAccepted ? (
                    <button
                      onClick={() => markReady(order.id)}
                      disabled={busyId === order.id}
                      className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
                    >
                      {busyId === order.id ? 'Marking…' : 'Mark ready'}
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => acceptOrder(order.id)}
                          disabled={busyId === order.id}
                          className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-65"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectOrder(order.id)}
                          disabled={busyId === order.id}
                          className="rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-65"
                        >
                          Reject
                        </button>
                      </div>
                      <input
                        placeholder="Rejection reason"
                        value={reasonById[order.id] ?? ''}
                        onChange={(e) =>
                          setReasonById((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        className="w-40 rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-2 py-1.5 text-xs"
                      />
                    </div>
                  )}
                  {errorById[order.id] && (
                    <p className="mt-1 text-xs text-red-700">{errorById[order.id]}</p>
                  )}
                  {anyRejected && items[0].vendorRejectionReason && (
                    <p className="mt-1 text-xs text-[#5B6B63]">{items[0].vendorRejectionReason}</p>
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
