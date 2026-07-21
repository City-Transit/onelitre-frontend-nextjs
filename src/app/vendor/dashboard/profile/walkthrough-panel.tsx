'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { uploadVendorDocument } from '@/lib/cloudinary-upload';
import { formatDate } from '@/lib/format';
import type { VendorWalkthrough } from '@/lib/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending review',
  passed: 'Passed',
  failed: 'Failed',
};

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-paper-dim text-[#5B6B63]',
  passed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export function WalkthroughPanel({
  initialWalkthroughs,
}: {
  initialWalkthroughs: VendorWalkthrough[];
}) {
  const router = useRouter();
  const [walkthroughs, setWalkthroughs] = useState(initialWalkthroughs);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latest = walkthroughs[0];
  const canUpload = !latest || latest.status === 'failed';

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const videoUrl = await uploadVendorDocument(file);
      const walkthrough: VendorWalkthrough = await apiFetch('/vendor/walkthroughs', {
        method: 'POST',
        body: JSON.stringify({ videoUrl }),
      });
      setWalkthroughs((prev) => [walkthrough, ...prev]);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong uploading your walkthrough video. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#5B6B63]">
        A short video walking through your kitchen — prep area, storage, handwashing station.
        We&apos;ll review it against a basic hygiene checklist before your kitchen can be
        approved.
      </p>

      {walkthroughs.length === 0 ? (
        <p className="text-sm text-[#8A8073]">No walkthrough submitted yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {walkthroughs.map((w) => (
            <div
              key={w.id}
              className="rounded-[10px] border border-[rgba(18,33,29,0.14)] p-4 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[w.status]}`}>
                  {STATUS_LABEL[w.status]}
                </span>
                <span className="text-xs text-[#8A8073]">
                  {formatDate(w.createdAt)}
                </span>
              </div>
              {w.reviewerNote && (
                <p className="mt-2 text-xs text-[#5B6B63]">Note: {w.reviewerNote}</p>
              )}
              {w.checklist && w.status === 'failed' && (
                <ul className="mt-2 flex flex-col gap-1 text-xs">
                  {w.checklist
                    .filter((c) => !c.passed)
                    .map((c) => (
                      <li key={c.key} className="text-red-700">
                        ✕ {c.key.replace(/_/g, ' ')}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {canUpload && (
        <label className="w-fit cursor-pointer rounded-full bg-paprika-dim px-4 py-2.5 text-sm font-semibold text-white hover:bg-paprika">
          {uploading ? 'Uploading…' : latest ? 'Resubmit walkthrough video' : 'Upload walkthrough video'}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = '';
            }}
          />
        </label>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
