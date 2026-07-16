'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Vendor } from '@/lib/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  suspended: 'Suspended',
};

export function VendorsTable({
  initialVendors,
  canManage,
}: {
  initialVendors: Vendor[];
  canManage: boolean;
}) {
  const [vendors, setVendors] = useState(initialVendors);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(vendorId: string, status: 'approved' | 'suspended') {
    setBusyId(vendorId);
    await apiFetch(`/admin/vendors/${vendorId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, status } : v)));
    setBusyId(null);
  }

  if (vendors.length === 0) {
    return (
      <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        No vendors yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[20px] bg-paper text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
          <tr>
            <th className="px-6 py-4">Kitchen</th>
            <th className="px-6 py-4">Area</th>
            <th className="px-6 py-4">Address</th>
            <th className="px-6 py-4">Verification</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="border-t border-[rgba(18,33,29,0.1)]">
              <td className="px-6 py-4 font-semibold">{vendor.name}</td>
              <td className="px-6 py-4 text-[#5B6B63]">{vendor.area}</td>
              <td className="px-6 py-4 text-[#5B6B63]">{vendor.address ?? '—'}</td>
              <td className="px-6 py-4 text-[#5B6B63]">
                <div>{vendor.contactPhone ?? '—'}</div>
                <div className="mt-1 text-xs">
                  {vendor.isRegisteredBusiness
                    ? `Registered${vendor.registrationNumber ? ` · ${vendor.registrationNumber}` : ''}`
                    : 'Not registered'}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold">
                  {STATUS_LABEL[vendor.status ?? 'pending']}
                </span>
              </td>
              <td className="px-6 py-4">
                {canManage ? (
                  <div className="flex justify-end gap-2">
                    {vendor.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setStatus(vendor.id, 'approved')}
                          disabled={busyId === vendor.id}
                          className="rounded-full bg-paprika-dim px-4 py-2 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setStatus(vendor.id, 'suspended')}
                          disabled={busyId === vendor.id}
                          className="rounded-full border border-[rgba(18,33,29,0.2)] px-4 py-2 text-xs font-semibold disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {vendor.status === 'approved' && (
                      <button
                        onClick={() => setStatus(vendor.id, 'suspended')}
                        disabled={busyId === vendor.id}
                        className="rounded-full border border-red-700/30 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                      >
                        Suspend
                      </button>
                    )}
                    {vendor.status === 'suspended' && (
                      <button
                        onClick={() => setStatus(vendor.id, 'approved')}
                        disabled={busyId === vendor.id}
                        className="rounded-full bg-paprika-dim px-4 py-2 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-right text-xs text-[#8A8073]">View only</div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
