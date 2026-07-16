import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type { Vendor } from '@/lib/types';
import { ProfilePanel } from './profile-panel';

export default async function VendorProfilePage() {
  const res = await serverApiFetch('/vendor/profile');
  if (!res.ok) {
    redirect('/login');
  }
  const vendor: Vendor = await res.json();

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Profile</h2>
      <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <ProfilePanel vendor={vendor} />
      </div>
    </div>
  );
}
