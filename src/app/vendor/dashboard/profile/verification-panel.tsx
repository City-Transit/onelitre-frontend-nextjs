'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { uploadVendorDocument } from '@/lib/cloudinary-upload';
import { formatDate } from '@/lib/format';
import { buildContractSections } from '@/lib/vendor-contract';
import type { Vendor, VendorDocument, VendorDocumentType } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const NUMBER_DOCUMENT_TYPES: { type: VendorDocumentType; label: string; placeholder: string }[] = [
  { type: 'nin', label: 'NIN', placeholder: '12345678901' },
  { type: 'cac', label: 'CAC / business registration number', placeholder: 'RC1234567' },
];

const CAC_COMPANY_TYPES: { value: string; label: string }[] = [
  { value: 'BUSINESS_NAME', label: 'Business name' },
  { value: 'COMPANY', label: 'Company' },
  { value: 'INCORPORATED_TRUSTEES', label: 'Incorporated trustees' },
  { value: 'LIMITED_PARTNERSHIP', label: 'Limited partnership' },
  { value: 'LIMITED_LIABILITY_PARTNERSHIP', label: 'Limited liability partnership' },
];

const FILE_DOCUMENT_TYPES: { type: VendorDocumentType; label: string }[] = [
  { type: 'food_safety', label: 'Food safety certificate' },
];

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending review',
  verified: 'Verified',
  rejected: 'Rejected',
};

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-paper-dim text-[#5B6B63]',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export function VerificationPanel({
  vendor,
  initialDocuments,
}: {
  vendor: Vendor;
  initialDocuments: VendorDocument[];
}) {
  const router = useRouter();
  const [contractAcceptedAt, setContractAcceptedAt] = useState(vendor.contractAcceptedAt);
  const [contractDeclinedAt, setContractDeclinedAt] = useState(vendor.contractDeclinedAt);
  const [contractSignatureName, setContractSignatureName] = useState(
    vendor.contractSignatureName,
  );
  const [signatureDraft, setSignatureDraft] = useState('');
  const [contractBusy, setContractBusy] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [numberDrafts, setNumberDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      NUMBER_DOCUMENT_TYPES.map(({ type }) => [
        type,
        documents.find((d) => d.type === type)?.value ?? '',
      ]),
    ),
  );
  const [companyType, setCompanyType] = useState('BUSINESS_NAME');
  const [busyType, setBusyType] = useState<VendorDocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasCustomSplit =
    vendor.customAdvancePct != null &&
    vendor.customRemainderPct != null &&
    vendor.customCommissionPct != null;
  const contractSections = buildContractSections(vendor.effectiveSplit, hasCustomSplit);

  async function respondToContract(action: 'accept' | 'decline') {
    setContractError(null);
    if (action === 'accept' && signatureDraft.trim().length < 3) {
      setContractError('Type your full legal name to sign before accepting.');
      return;
    }
    setContractBusy(true);
    try {
      const updated: Vendor = await apiFetch(`/vendor/contract/${action}`, {
        method: 'POST',
        body:
          action === 'accept'
            ? JSON.stringify({ signatureName: signatureDraft.trim() })
            : undefined,
      });
      setContractAcceptedAt(updated.contractAcceptedAt);
      setContractDeclinedAt(updated.contractDeclinedAt);
      setContractSignatureName(updated.contractSignatureName);
      router.refresh();
    } catch {
      setContractError('Something went wrong recording your response. Please try again.');
    } finally {
      setContractBusy(false);
    }
  }

  async function saveNumber(type: VendorDocumentType) {
    const value = numberDrafts[type]?.trim();
    if (!value) return;
    setBusyType(type);
    setError(null);
    try {
      const document: VendorDocument = await apiFetch('/vendor/documents', {
        method: 'POST',
        body: JSON.stringify(
          type === 'cac' ? { type, value, companyType } : { type, value },
        ),
      });
      setDocuments((prev) => [...prev.filter((d) => d.type !== type), document]);
    } catch {
      setError('Something went wrong saving that number. Please try again.');
    } finally {
      setBusyType(null);
    }
  }

  async function handleUpload(type: VendorDocumentType, file: File) {
    setBusyType(type);
    setError(null);
    try {
      const fileUrl = await uploadVendorDocument(file);
      const document: VendorDocument = await apiFetch('/vendor/documents', {
        method: 'POST',
        body: JSON.stringify({ type, fileUrl }),
      });
      setDocuments((prev) => [...prev.filter((d) => d.type !== type), document]);
    } catch {
      setError('Something went wrong uploading that document. Please try again.');
    } finally {
      setBusyType(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-semibold">Vendor contract</h3>
        <div className="mt-3 max-h-64 overflow-y-auto rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim p-4 text-sm">
          {contractSections.map((section) => (
            <div key={section.heading} className="mb-4 last:mb-0">
              <div className="font-semibold">{section.heading}</div>
              <p className="mt-1 text-[#5B6B63]">{section.body}</p>
            </div>
          ))}
        </div>

        <a
          href={`${API_BASE_URL}/vendor/contract/pdf`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-semibold underline"
        >
          Download contract (PDF)
        </a>

        {contractAcceptedAt ? (
          <p className="mt-3 text-sm text-green-700">
            Signed as &ldquo;{contractSignatureName}&rdquo; on{' '}
            {formatDate(contractAcceptedAt)}.
          </p>
        ) : contractDeclinedAt ? (
          <div className="mt-3">
            <p className="text-sm text-red-700">
              You declined these terms on {formatDate(contractDeclinedAt)}.
              You can&apos;t list meals until you accept them — contact Onelitre support if
              you&apos;d like to reconsider, or type your name below to accept.
            </p>
            <input
              placeholder="Type your full legal name to sign"
              value={signatureDraft}
              onChange={(e) => setSignatureDraft(e.target.value)}
              className="mt-3 w-full max-w-sm rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper px-3 py-2 text-sm"
            />
            <button
              onClick={() => respondToContract('accept')}
              disabled={contractBusy}
              className="mt-3 block rounded-full bg-paprika-dim px-5 py-2.5 text-sm font-semibold text-white hover:bg-paprika disabled:opacity-65"
            >
              {contractBusy ? 'Saving…' : 'Accept contract'}
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <label className="text-sm font-semibold">
              Type your full legal name to sign
            </label>
            <input
              placeholder="e.g. Ngozi Adeyemi"
              value={signatureDraft}
              onChange={(e) => setSignatureDraft(e.target.value)}
              className="w-full max-w-sm rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => respondToContract('accept')}
                disabled={contractBusy}
                className="rounded-full bg-paprika-dim px-5 py-2.5 text-sm font-semibold text-white hover:bg-paprika disabled:opacity-65"
              >
                {contractBusy ? 'Saving…' : 'Accept'}
              </button>
              <button
                onClick={() => respondToContract('decline')}
                disabled={contractBusy}
                className="rounded-full border border-red-700/30 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-65"
              >
                Decline
              </button>
            </div>
          </div>
        )}
        {contractError && <p className="mt-2 text-sm text-red-700">{contractError}</p>}
      </div>

      <div>
        <h3 className="font-semibold">Verification</h3>
        <p className="mt-1 text-sm text-[#5B6B63]">
          NIN and CAC numbers are checked automatically where possible; anything that needs a
          closer look is reviewed by the Onelitre team. This doesn&apos;t block listing meals,
          but is required before your kitchen can be fully approved.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {NUMBER_DOCUMENT_TYPES.map(({ type, label, placeholder }) => {
            const doc = documents.find((d) => d.type === type);
            return (
              <div
                key={type}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[rgba(18,33,29,0.14)] p-3"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold">{label}</div>
                  {doc && (
                    <div className="mt-1 flex flex-col gap-1 text-xs">
                      <span
                        className={`w-fit rounded-full px-2 py-0.5 font-semibold ${STATUS_CLASS[doc.status]}`}
                      >
                        {STATUS_LABEL[doc.status]}
                      </span>
                      {doc.reviewerNote && (
                        <span className={doc.status === 'rejected' ? 'text-red-700' : 'text-[#5B6B63]'}>
                          {doc.reviewerNote}
                        </span>
                      )}
                    </div>
                  )}
                  <input
                    placeholder={placeholder}
                    value={numberDrafts[type] ?? ''}
                    onChange={(e) =>
                      setNumberDrafts((prev) => ({ ...prev, [type]: e.target.value }))
                    }
                    className="mt-2 w-full max-w-xs rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper px-3 py-2 text-sm"
                  />
                  {type === 'cac' && (
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="mt-2 w-full max-w-xs rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper px-3 py-2 text-sm"
                    >
                      {CAC_COMPANY_TYPES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  onClick={() => saveNumber(type)}
                  disabled={busyType === type}
                  className="rounded-full border border-[rgba(18,33,29,0.2)] px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  {busyType === type ? 'Saving…' : 'Save'}
                </button>
              </div>
            );
          })}
          {FILE_DOCUMENT_TYPES.map(({ type, label }) => {
            const doc = documents.find((d) => d.type === type);
            return (
              <div
                key={type}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[rgba(18,33,29,0.14)] p-3"
              >
                <div>
                  <div className="text-sm font-semibold">{label}</div>
                  {doc && (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_CLASS[doc.status]}`}>
                        {STATUS_LABEL[doc.status]}
                      </span>
                      {doc.status === 'rejected' && doc.reviewerNote && (
                        <span className="text-red-700">{doc.reviewerNote}</span>
                      )}
                    </div>
                  )}
                </div>
                <label className="cursor-pointer rounded-full border border-[rgba(18,33,29,0.2)] px-3 py-1.5 text-xs font-semibold">
                  {busyType === type ? 'Uploading…' : doc ? 'Replace' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={busyType === type}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(type, file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
