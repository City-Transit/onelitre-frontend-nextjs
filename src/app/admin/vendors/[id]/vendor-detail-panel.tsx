'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api-base-url';
import { formatDate } from '@/lib/format';
import { WALKTHROUGH_CHECKLIST_ITEMS } from '@/lib/vendor-walkthrough-checklist';
import type {
  Badge,
  Vendor,
  VendorDocument,
  VendorDocumentType,
  VendorIncident,
  VendorIncidentType,
  VendorOrderGroup,
  VendorWalkthrough,
} from '@/lib/types';

const DOCUMENT_LABEL: Record<VendorDocumentType, string> = {
  nin: 'NIN',
  cac: 'CAC certificate',
  food_safety: 'Food safety certificate',
};

const WALKTHROUGH_STATUS_CLASS: Record<string, string> = {
  pending: 'bg-paper-dim text-[#5B6B63]',
  passed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const CONSEQUENCE_LABEL: Record<string, string> = {
  warning: 'Warning',
  paused: 'Paused',
  suspended: 'Suspended',
  offboarded: 'Offboarded',
};

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-paper-dim text-[#5B6B63]',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  placed: 'Placed',
  accepted: 'Accepted',
  ready_for_delivery: 'Ready for delivery',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

function VendorOrdersTable({
  groups,
  emptyLabel,
}: {
  groups: VendorOrderGroup[];
  emptyLabel: string;
}) {
  if (groups.length === 0) {
    return <p className="mt-2 text-sm text-[#5B6B63]">{emptyLabel}</p>;
  }
  return (
    <div className="mt-3 overflow-x-auto rounded-[14px] border border-[rgba(18,33,29,0.1)]">
      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
          <tr>
            <th className="px-4 py-3">Placed</th>
            <th className="px-4 py-3">Delivery address</th>
            <th className="px-4 py-3">Date / time</th>
            <th className="px-4 py-3">Kitchen total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(({ order, items }) => (
            <tr key={order.id} className="border-t border-[rgba(18,33,29,0.1)]">
              <td className="px-4 py-3 whitespace-nowrap text-[#5B6B63]">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-3">{order.deliveryAddress}</td>
              <td className="px-4 py-3 text-[#5B6B63] whitespace-nowrap">
                {order.deliveryDate} · {order.deliveryTimeSlot}
              </td>
              <td className="px-4 py-3 font-semibold whitespace-nowrap">
                {naira(items.reduce((sum, item) => sum + item.lineTotal, 0))}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold">
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VendorDetailPanel({
  vendor,
  initialDocuments,
  orderGroups,
  initialWalkthroughs,
  initialIncidents,
  allBadges,
}: {
  vendor: Vendor;
  initialDocuments: VendorDocument[];
  orderGroups: VendorOrderGroup[];
  initialWalkthroughs: VendorWalkthrough[];
  initialIncidents: VendorIncident[];
  allBadges: Badge[];
}) {
  const router = useRouter();
  const [vendorBadges, setVendorBadges] = useState(vendor.badges ?? []);
  const [badgeToAdd, setBadgeToAdd] = useState('');
  const [badgeBusy, setBadgeBusy] = useState(false);
  const assignableBadges = allBadges.filter(
    (b) => !vendorBadges.some((vb) => vb.id === b.id),
  );

  async function addBadge() {
    if (!badgeToAdd) return;
    setBadgeBusy(true);
    try {
      const updated: Vendor = await apiFetch(`/admin/vendors/${vendor.id}/badges`, {
        method: 'POST',
        body: JSON.stringify({ badgeId: badgeToAdd }),
      });
      setVendorBadges(updated.badges ?? []);
      setBadgeToAdd('');
    } finally {
      setBadgeBusy(false);
    }
  }

  async function removeBadge(badgeId: string) {
    setBadgeBusy(true);
    try {
      const updated: Vendor = await apiFetch(
        `/admin/vendors/${vendor.id}/badges/${badgeId}`,
        { method: 'DELETE' },
      );
      setVendorBadges(updated.badges ?? []);
    } finally {
      setBadgeBusy(false);
    }
  }

  const [effectiveSplit, setEffectiveSplit] = useState(vendor.effectiveSplit);
  const [customPcts, setCustomPcts] = useState({
    advancePct: vendor.customAdvancePct,
    remainderPct: vendor.customRemainderPct,
    commissionPct: vendor.customCommissionPct,
  });
  const [commissionDraft, setCommissionDraft] = useState({
    advancePct: vendor.customAdvancePct != null ? String(vendor.customAdvancePct) : '',
    remainderPct: vendor.customRemainderPct != null ? String(vendor.customRemainderPct) : '',
    commissionPct: vendor.customCommissionPct != null ? String(vendor.customCommissionPct) : '',
  });
  const [commissionBusy, setCommissionBusy] = useState(false);
  const [commissionError, setCommissionError] = useState<string | null>(null);

  async function saveCommissionOverride() {
    setCommissionError(null);
    const advancePct = Number(commissionDraft.advancePct);
    const remainderPct = Number(commissionDraft.remainderPct);
    const commissionPct = Number(commissionDraft.commissionPct);
    if (advancePct + remainderPct + commissionPct !== 100) {
      setCommissionError('advancePct, remainderPct and commissionPct must sum to 100.');
      return;
    }
    setCommissionBusy(true);
    try {
      const updated: Vendor = await apiFetch(`/admin/vendors/${vendor.id}/commission`, {
        method: 'PATCH',
        body: JSON.stringify({ advancePct, remainderPct, commissionPct }),
      });
      setEffectiveSplit(updated.effectiveSplit);
      setCustomPcts({
        advancePct: updated.customAdvancePct,
        remainderPct: updated.customRemainderPct,
        commissionPct: updated.customCommissionPct,
      });
      router.refresh();
    } catch {
      setCommissionError('Something went wrong saving the override. Please try again.');
    } finally {
      setCommissionBusy(false);
    }
  }

  async function clearCommissionOverride() {
    setCommissionError(null);
    setCommissionBusy(true);
    try {
      const updated: Vendor = await apiFetch(`/admin/vendors/${vendor.id}/commission`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      setEffectiveSplit(updated.effectiveSplit);
      setCustomPcts({ advancePct: null, remainderPct: null, commissionPct: null });
      setCommissionDraft({ advancePct: '', remainderPct: '', commissionPct: '' });
      router.refresh();
    } catch {
      setCommissionError('Something went wrong clearing the override. Please try again.');
    } finally {
      setCommissionBusy(false);
    }
  }

  const [documents, setDocuments] = useState(initialDocuments);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  const [walkthroughs, setWalkthroughs] = useState(initialWalkthroughs);
  const [checklistDraft, setChecklistDraft] = useState<Record<string, boolean>>({});
  const [walkthroughNote, setWalkthroughNote] = useState('');
  const [walkthroughBusy, setWalkthroughBusy] = useState(false);
  const [walkthroughError, setWalkthroughError] = useState<string | null>(null);

  const [incidents, setIncidents] = useState(initialIncidents);
  const [incidentType, setIncidentType] = useState<VendorIncidentType>('quality');
  const [incidentReason, setIncidentReason] = useState('');
  const [incidentPauseDays, setIncidentPauseDays] = useState('45');
  const [incidentBusy, setIncidentBusy] = useState(false);
  const [incidentError, setIncidentError] = useState<string | null>(null);

  async function review(docId: string, status: 'verified' | 'rejected') {
    setBusyId(docId);
    setErrorById((prev) => ({ ...prev, [docId]: '' }));
    try {
      const updated: VendorDocument = await apiFetch(
        `/admin/vendors/${vendor.id}/documents/${docId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, reviewerNote: noteById[docId] || undefined }),
        },
      );
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [docId]: err instanceof ApiError ? err.message : 'Something went wrong.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function submitWalkthroughReview(walkthroughId: string) {
    setWalkthroughBusy(true);
    setWalkthroughError(null);
    try {
      const checklist = WALKTHROUGH_CHECKLIST_ITEMS.map((item) => ({
        key: item.key,
        passed: checklistDraft[item.key] ?? false,
      }));
      const updated: VendorWalkthrough = await apiFetch(
        `/admin/vendors/${vendor.id}/walkthroughs/${walkthroughId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ checklist, note: walkthroughNote || undefined }),
        },
      );
      setWalkthroughs((prev) => prev.map((w) => (w.id === walkthroughId ? updated : w)));
      setChecklistDraft({});
      setWalkthroughNote('');
    } catch (err) {
      setWalkthroughError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setWalkthroughBusy(false);
    }
  }

  async function submitIncident() {
    setIncidentBusy(true);
    setIncidentError(null);
    try {
      const incident: VendorIncident = await apiFetch(`/admin/vendors/${vendor.id}/incidents`, {
        method: 'POST',
        body: JSON.stringify({
          type: incidentType,
          reason: incidentReason,
          pauseDays: Number(incidentPauseDays) || undefined,
        }),
      });
      setIncidents((prev) => [incident, ...prev]);
      setIncidentReason('');
    } catch (err) {
      setIncidentError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setIncidentBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Kitchen details</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Area</dt>
            <dd>{vendor.area ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Address</dt>
            <dd>{vendor.address ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Phone</dt>
            <dd>{vendor.contactPhone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Contract</dt>
            <dd>
              {vendor.contractAcceptedAt
                ? `Signed "${vendor.contractSignatureName}" ${formatDate(vendor.contractAcceptedAt)}`
                : vendor.contractDeclinedAt
                  ? `Declined ${formatDate(vendor.contractDeclinedAt)}`
                  : 'Not accepted'}
              {' · '}
              <a
                href={`${API_BASE_URL}/admin/vendors/${vendor.id}/contract/pdf`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
              >
                Download PDF
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#8A8073]">Status</dt>
            <dd className="capitalize">
              {vendor.status ?? 'pending'}
              {vendor.status === 'paused' && vendor.pausedUntil && (
                <span className="ml-1 text-xs normal-case text-[#8A8073]">
                  (until {formatDate(vendor.pausedUntil)})
                </span>
              )}
            </dd>
          </div>
          {vendor.dormancyRiskAt && (
            <div>
              <dt className="text-xs uppercase text-[#8A8073]">Dormancy risk</dt>
              <dd className="text-red-700">
                Flagged {formatDate(vendor.dormancyRiskAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Badges</h3>
        <p className="mt-1 text-sm text-[#5B6B63]">
          Shown to customers on the menu browser. &ldquo;Certified&rdquo; is separate — it&apos;s
          set automatically once CAC and food-safety documents are verified.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {vendorBadges.length === 0 && (
            <span className="text-sm text-[#8A8073]">No badges assigned.</span>
          )}
          {vendorBadges.map((b) => (
            <span
              key={b.id}
              className="flex items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold"
            >
              {b.label}
              <button
                onClick={() => removeBadge(b.id)}
                disabled={badgeBusy}
                aria-label={`Remove ${b.label} badge`}
                className="text-[#8A8073] hover:text-red-700 disabled:opacity-60"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {assignableBadges.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <select
              value={badgeToAdd}
              onChange={(e) => setBadgeToAdd(e.target.value)}
              className="rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2 text-sm"
            >
              <option value="">Select a badge…</option>
              {assignableBadges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <button
              onClick={addBadge}
              disabled={!badgeToAdd || badgeBusy}
              className="rounded-full bg-paprika-dim px-4 py-2 text-sm font-semibold text-white hover:bg-paprika disabled:opacity-60"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Payout split</h3>
        <p className="mt-1 text-sm text-[#5B6B63]">
          {customPcts.advancePct != null ? (
            <>
              <span className="font-semibold text-green-700">Custom override active</span> —{' '}
              {effectiveSplit.advancePct}% advance / {effectiveSplit.remainderPct}% remainder /{' '}
              {effectiveSplit.commissionPct}% commission.
            </>
          ) : (
            <>
              Automatic ({vendor.certifiedAt ? 'Certified' : 'Standard'} tier) —{' '}
              {effectiveSplit.advancePct}% advance / {effectiveSplit.remainderPct}% remainder /{' '}
              {effectiveSplit.commissionPct}% commission.
            </>
          )}
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase text-[#8A8073]">Advance %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={commissionDraft.advancePct}
              onChange={(e) =>
                setCommissionDraft((prev) => ({ ...prev, advancePct: e.target.value }))
              }
              className="w-24 rounded-[10px] border border-[rgba(18,33,29,0.14)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase text-[#8A8073]">Remainder %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={commissionDraft.remainderPct}
              onChange={(e) =>
                setCommissionDraft((prev) => ({ ...prev, remainderPct: e.target.value }))
              }
              className="w-24 rounded-[10px] border border-[rgba(18,33,29,0.14)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase text-[#8A8073]">Commission %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={commissionDraft.commissionPct}
              onChange={(e) =>
                setCommissionDraft((prev) => ({ ...prev, commissionPct: e.target.value }))
              }
              className="w-24 rounded-[10px] border border-[rgba(18,33,29,0.14)] px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={saveCommissionOverride}
            disabled={commissionBusy}
            className="rounded-full bg-paprika-dim px-4 py-2 text-sm font-semibold text-white disabled:opacity-65"
          >
            {commissionBusy ? 'Saving…' : 'Set override'}
          </button>
          {customPcts.advancePct != null && (
            <button
              onClick={clearCommissionOverride}
              disabled={commissionBusy}
              className="rounded-full border border-red-700/30 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-65"
            >
              Clear override
            </button>
          )}
        </div>
        {commissionError && <p className="mt-2 text-sm text-red-700">{commissionError}</p>}
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Verification documents</h3>
        {documents.length === 0 ? (
          <p className="mt-2 text-sm text-[#5B6B63]">No documents uploaded yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="rounded-[10px] border border-[rgba(18,33,29,0.14)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{DOCUMENT_LABEL[doc.type]}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[doc.status]}`}>
                      {doc.status}
                    </span>
                  </div>
                  {doc.value ? (
                    <span className="font-mono text-xs">{doc.value}</span>
                  ) : doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold underline"
                    >
                      View file
                    </a>
                  ) : null}
                </div>
                {doc.status === 'pending' && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      placeholder="Note (optional)"
                      value={noteById[doc.id] ?? ''}
                      onChange={(e) =>
                        setNoteById((prev) => ({ ...prev, [doc.id]: e.target.value }))
                      }
                      className="rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2 text-xs"
                    />
                    <button
                      onClick={() => review(doc.id, 'verified')}
                      disabled={busyId === doc.id}
                      className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => review(doc.id, 'rejected')}
                      disabled={busyId === doc.id}
                      className="rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {doc.reviewerNote && doc.status !== 'pending' && (
                  <p className="mt-2 text-xs text-[#5B6B63]">Note: {doc.reviewerNote}</p>
                )}
                {errorById[doc.id] && (
                  <p className="mt-2 text-xs text-red-700">{errorById[doc.id]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Listings ({vendor.meals.length})</h3>
        {vendor.meals.length === 0 ? (
          <p className="mt-2 text-sm text-[#5B6B63]">No meals listed yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {vendor.meals.map((meal) => (
              <div
                key={meal.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[rgba(18,33,29,0.14)] p-4"
              >
                <div>
                  <span className="text-sm font-semibold">{meal.name}</span>
                  {meal.available === false && (
                    <span className="ml-2 text-xs text-[#8A8073]">(unavailable)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {meal.approvalStatus && (
                    <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold capitalize">
                      {meal.approvalStatus}
                    </span>
                  )}
                  <span className="text-xs text-[#5B6B63]">
                    {meal.litres}L · ₦{meal.price.toLocaleString('en-NG')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Kitchen walkthrough</h3>
        {walkthroughs.length === 0 ? (
          <p className="mt-2 text-sm text-[#5B6B63]">No walkthrough submitted yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {walkthroughs.map((w) => (
              <div key={w.id} className="rounded-[10px] border border-[rgba(18,33,29,0.14)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${WALKTHROUGH_STATUS_CLASS[w.status]}`}
                  >
                    {w.status}
                  </span>
                  <a
                    href={w.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold underline"
                  >
                    View video
                  </a>
                </div>
                {w.status === 'pending' ? (
                  <div className="mt-3 flex flex-col gap-2">
                    {WALKTHROUGH_CHECKLIST_ITEMS.map((item) => (
                      <label key={item.key} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={checklistDraft[item.key] ?? false}
                          onChange={(e) =>
                            setChecklistDraft((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                        />
                        {item.label}
                      </label>
                    ))}
                    <input
                      placeholder="Note (optional)"
                      value={walkthroughNote}
                      onChange={(e) => setWalkthroughNote(e.target.value)}
                      className="mt-1 rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2 text-xs"
                    />
                    <button
                      onClick={() => submitWalkthroughReview(w.id)}
                      disabled={walkthroughBusy}
                      className="mt-1 w-fit rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                    >
                      Submit review
                    </button>
                    {walkthroughError && (
                      <p className="text-xs text-red-700">{walkthroughError}</p>
                    )}
                  </div>
                ) : (
                  <>
                    {w.reviewerNote && (
                      <p className="mt-2 text-xs text-[#5B6B63]">Note: {w.reviewerNote}</p>
                    )}
                    {w.checklist && (
                      <ul className="mt-2 flex flex-col gap-0.5 text-xs">
                        {w.checklist.map((c) => (
                          <li key={c.key} className={c.passed ? 'text-green-700' : 'text-red-700'}>
                            {c.passed ? '✓' : '✕'}{' '}
                            {WALKTHROUGH_CHECKLIST_ITEMS.find((i) => i.key === c.key)?.label ??
                              c.key}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">Incidents ({incidents.length})</h3>
        {incidents.length === 0 ? (
          <p className="mt-2 text-sm text-[#5B6B63]">No incidents on record.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-[10px] border border-[rgba(18,33,29,0.14)] p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold capitalize">{incident.type}</span>
                  <span className="rounded-full bg-paper-dim px-2 py-0.5 text-xs font-semibold">
                    {CONSEQUENCE_LABEL[incident.consequence]}
                    {incident.pauseDays ? ` (${incident.pauseDays}d)` : ''}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#5B6B63]">{incident.reason}</p>
                <p className="mt-1 text-xs text-[#8A8073]">
                  {formatDate(incident.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 border-t border-[rgba(18,33,29,0.14)] pt-4">
          <label className="text-sm font-semibold">Raise an incident</label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as VendorIncidentType)}
              className="rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2 text-xs"
            >
              <option value="quality">Quality</option>
              <option value="safety">Safety (immediate suspension)</option>
              <option value="fraud">Fraud (immediate offboard)</option>
            </select>
            {incidentType === 'quality' && (
              <input
                type="number"
                min={30}
                max={60}
                value={incidentPauseDays}
                onChange={(e) => setIncidentPauseDays(e.target.value)}
                title="Pause days if this lands as a 2nd strike (30–60)"
                className="w-20 rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2 text-xs"
              />
            )}
          </div>
          <input
            placeholder="Reason"
            value={incidentReason}
            onChange={(e) => setIncidentReason(e.target.value)}
            className="rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2 text-xs"
          />
          <button
            onClick={submitIncident}
            disabled={incidentBusy || incidentReason.trim().length < 3}
            className="w-fit rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
          >
            Raise incident
          </button>
          {incidentError && <p className="text-xs text-red-700">{incidentError}</p>}
        </div>
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">
          Completed orders ({orderGroups.filter((g) => g.order.status === 'delivered').length})
        </h3>
        <VendorOrdersTable
          groups={orderGroups.filter((g) => g.order.status === 'delivered')}
          emptyLabel="No completed orders yet."
        />
      </div>

      <div className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <h3 className="font-semibold">
          Orders not completed ({orderGroups.filter((g) => g.order.status !== 'delivered').length})
        </h3>
        <VendorOrdersTable
          groups={orderGroups.filter((g) => g.order.status !== 'delivered')}
          emptyLabel="Nothing outstanding."
        />
      </div>
    </div>
  );
}
