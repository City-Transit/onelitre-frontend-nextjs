import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type { Vendor, VendorDocument, VendorWalkthrough } from '@/lib/types';
import { ProfilePanel } from './profile-panel';
import { VerificationPanel } from './verification-panel';
import { PayoutAccountPanel } from './payout-account-panel';
import { WalkthroughPanel } from './walkthrough-panel';

export default async function VendorProfilePage() {
  const [profileRes, documentsRes, walkthroughsRes] = await Promise.all([
    serverApiFetch('/vendor/profile'),
    serverApiFetch('/vendor/documents'),
    serverApiFetch('/vendor/walkthroughs'),
  ]);
  if (!profileRes.ok) {
    redirect('/login');
  }
  const vendor: Vendor = await profileRes.json();
  const documents: VendorDocument[] = documentsRes.ok ? await documentsRes.json() : [];
  const walkthroughs: VendorWalkthrough[] = walkthroughsRes.ok
    ? await walkthroughsRes.json()
    : [];

  return (
    <div className="flex flex-col gap-6">
      {vendor.status === 'paused' && (
        <div className="rounded-[16px] bg-paper p-5 text-sm font-semibold text-red-700 shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          Your kitchen is paused
          {vendor.pausedUntil && ` until ${new Date(vendor.pausedUntil).toLocaleDateString()}`} —
          contact support for details.
        </div>
      )}
      {vendor.status === 'offboarded' && (
        <div className="rounded-[16px] bg-paper p-5 text-sm font-semibold text-red-700 shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          Your kitchen has been permanently offboarded.
        </div>
      )}
      {vendor.dormancyRiskAt && (
        <div className="rounded-[16px] bg-paper p-5 text-sm font-semibold text-[#8A8073] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          Your kitchen has been inactive for a while — re-verification is required. Take an
          action below (update your profile, or accept an order) to clear this and re-verify.
        </div>
      )}

      <div>
        <h2 className="mb-4 text-xl text-paper">Kitchen walkthrough</h2>
        <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <WalkthroughPanel initialWalkthroughs={walkthroughs} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl text-paper">Contract &amp; verification</h2>
        <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <VerificationPanel vendor={vendor} initialDocuments={documents} />
          <p className="mt-4 text-sm font-semibold">
            {vendor.certifiedAt ? (
              <span className="text-green-700">
                Certified since {new Date(vendor.certifiedAt).toLocaleDateString()} — 60% advance
                rate applies.
              </span>
            ) : (
              <span className="text-[#8A8073]">
                Not yet certified — verify your CAC and food safety certificate above to unlock
                the 60% advance rate. Standard rate (40% advance) applies until then.
              </span>
            )}
          </p>
          <p className="mt-2 text-xs text-[#8A8073]">
            NIN and BVN verification are required separately before your kitchen can be approved
            — they don&apos;t affect the Certified badge above.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl text-paper">Payout account</h2>
        <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <PayoutAccountPanel vendor={vendor} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl text-paper">Profile</h2>
        <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <ProfilePanel vendor={vendor} />
        </div>
      </div>
    </div>
  );
}
