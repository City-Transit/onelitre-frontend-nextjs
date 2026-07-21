'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { uploadDispatchPhoto } from '@/lib/cloudinary-upload';
import { formatDate } from '@/lib/format';
import type { Order } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
const DISPATCH_PHOTO_THRESHOLD = 50000;
const DISPUTE_WINDOW_MS = 24 * 60 * 60 * 1000;

const STATUS_LABEL: Record<string, string> = {
  placed: 'Placed',
  ready_for_delivery: 'Ready for delivery',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function hoursRemaining(deliveryConfirmedAt: string): number {
  const dueAt = new Date(deliveryConfirmedAt).getTime() + DISPUTE_WINDOW_MS;
  return Math.max(0, Math.ceil((dueAt - Date.now()) / (60 * 60 * 1000)));
}

export function DispatchOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [photoConfirmedIds, setPhotoConfirmedIds] = useState<Set<string>>(new Set());
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });

  function patchOrder(orderId: string, patch: Partial<Order>) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)));
  }

  async function setStatus(orderId: string, status: 'out_for_delivery' | 'cancelled') {
    setBusyId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: '' }));
    try {
      await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      patchOrder(orderId, { status });
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [orderId]: err instanceof ApiError ? err.message : 'Something went wrong.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function uploadPhotoThenDispatch(orderId: string, file: File) {
    setBusyId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: '' }));
    try {
      const photoUrl = await uploadDispatchPhoto(orderId, file);
      await apiFetch(`/admin/orders/${orderId}/dispatch-photos`, {
        method: 'POST',
        body: JSON.stringify({ photoUrl }),
      });
      setPhotoConfirmedIds((prev) => new Set(prev).add(orderId));
      await setStatus(orderId, 'out_for_delivery');
    } catch {
      setErrorById((prev) => ({ ...prev, [orderId]: 'Photo upload failed. Please try again.' }));
      setBusyId(null);
    }
  }

  function startDeliveryConfirmation(orderId: string) {
    setConfirmingId(orderId);
    setCoords({ lat: '', lng: '' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({
            lat: String(pos.coords.latitude),
            lng: String(pos.coords.longitude),
          }),
        () => {}, // manual entry still available if geolocation is denied/unavailable
      );
    }
  }

  async function confirmDelivery(orderId: string, file: File) {
    setBusyId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: '' }));
    try {
      const deliveryPhotoUrl = await uploadDispatchPhoto(orderId, file);
      const updated: Order = await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'delivered',
          deliveryPhotoUrl,
          deliveryLat: Number(coords.lat),
          deliveryLng: Number(coords.lng),
        }),
      });
      patchOrder(orderId, updated);
      setConfirmingId(null);
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [orderId]: err instanceof ApiError ? err.message : 'Something went wrong.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function raiseDispute(orderId: string) {
    const reason = window.prompt('Reason for the dispute?');
    if (!reason) return;
    setBusyId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: '' }));
    try {
      const updated: Order = await apiFetch(`/admin/orders/${orderId}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      patchOrder(orderId, updated);
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [orderId]: err instanceof ApiError ? err.message : 'Something went wrong.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function resolveDispute(orderId: string, outcome: 'upheld' | 'dismissed') {
    setBusyId(orderId);
    setErrorById((prev) => ({ ...prev, [orderId]: '' }));
    try {
      const updated: Order = await apiFetch(`/admin/orders/${orderId}/dispute/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome }),
      });
      patchOrder(orderId, updated);
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [orderId]: err instanceof ApiError ? err.message : 'Something went wrong.',
      }));
    } finally {
      setBusyId(null);
    }
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
                {formatDate(order.createdAt)}
              </td>
              <td className="px-6 py-4">
                <div>{order.deliveryAddress}</div>
                {order.deliveryArea && (
                  <div className="text-xs text-[#8A8073]">{order.deliveryArea}</div>
                )}
              </td>
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
                {confirmingId === order.id ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={coords.lat}
                        onChange={(e) => setCoords((c) => ({ ...c, lat: e.target.value }))}
                        className="w-28 rounded-[8px] border border-[rgba(18,33,29,0.14)] px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={coords.lng}
                        onChange={(e) => setCoords((c) => ({ ...c, lng: e.target.value }))}
                        className="w-28 rounded-[8px] border border-[rgba(18,33,29,0.14)] px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="cursor-pointer rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika">
                        {busyId === order.id ? 'Confirming…' : 'Upload delivery photo & confirm'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={busyId === order.id || !coords.lat || !coords.lng}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) confirmDelivery(order.id, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="rounded-full border border-[rgba(18,33,29,0.2)] px-3 py-1.5 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                    {(!coords.lat || !coords.lng) && (
                      <p className="text-xs text-[#8A8073]">Location required — enter manually if prompt was denied.</p>
                    )}
                  </div>
                ) : order.status === 'ready_for_delivery' ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex justify-end gap-2">
                      {order.subtotal > DISPATCH_PHOTO_THRESHOLD &&
                      !photoConfirmedIds.has(order.id) ? (
                        <label className="cursor-pointer rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika">
                          {busyId === order.id ? 'Uploading…' : 'Upload dispatch photo'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={busyId === order.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadPhotoThenDispatch(order.id, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      ) : (
                        <button
                          onClick={() => setStatus(order.id, 'out_for_delivery')}
                          disabled={busyId === order.id}
                          className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                        >
                          Out for delivery
                        </button>
                      )}
                      <button
                        onClick={() => startDeliveryConfirmation(order.id)}
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
                    {order.subtotal > DISPATCH_PHOTO_THRESHOLD && (
                      <p className="text-xs text-[#8A8073]">Orders over ₦50,000 need a dispatch photo.</p>
                    )}
                    {errorById[order.id] && (
                      <p className="text-xs text-red-700">{errorById[order.id]}</p>
                    )}
                  </div>
                ) : order.status === 'out_for_delivery' ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startDeliveryConfirmation(order.id)}
                        disabled={busyId === order.id}
                        className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                      >
                        Delivered
                      </button>
                    </div>
                    {errorById[order.id] && (
                      <p className="text-xs text-red-700">{errorById[order.id]}</p>
                    )}
                  </div>
                ) : order.status === 'delivered' ? (
                  <div className="flex flex-col items-end gap-1.5 text-right">
                    {order.disputeResolvedAt ? (
                      <span
                        className={`text-xs font-semibold ${
                          order.disputeOutcome === 'upheld' ? 'text-red-700' : 'text-green-700'
                        }`}
                      >
                        Dispute {order.disputeOutcome} — resolved{' '}
                        {formatDate(order.disputeResolvedAt)}
                      </span>
                    ) : order.disputeRaisedAt ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-semibold text-red-700">
                          Disputed: {order.disputeReason}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => resolveDispute(order.id, 'dismissed')}
                            disabled={busyId === order.id}
                            className="rounded-full border border-[rgba(18,33,29,0.2)] px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                          >
                            Dismiss (pay vendor)
                          </button>
                          <button
                            onClick={() => resolveDispute(order.id, 'upheld')}
                            disabled={busyId === order.id}
                            className="rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                          >
                            Uphold (withhold)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs text-[#8A8073]">
                          {order.deliveryConfirmedAt
                            ? `Remainder releases in ~${hoursRemaining(order.deliveryConfirmedAt)}h if undisputed`
                            : null}
                        </span>
                        <button
                          onClick={() => raiseDispute(order.id)}
                          disabled={busyId === order.id}
                          className="rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                        >
                          Raise dispute
                        </button>
                      </>
                    )}
                    {errorById[order.id] && (
                      <p className="text-xs text-red-700">{errorById[order.id]}</p>
                    )}
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
