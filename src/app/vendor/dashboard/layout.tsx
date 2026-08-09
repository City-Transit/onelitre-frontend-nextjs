import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type { Vendor } from '@/lib/types';
import { SiteHeader } from '@/components/site-header';
import LogoutButton from '../../dashboard/logout-button';
import { VendorNav } from './vendor-nav';

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await serverApiFetch('/vendor/profile');
  if (!res.ok) {
    redirect('/login');
  }
  const vendor: Vendor = await res.json();

  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
              Kitchen dashboard
            </div>
            <h1 className="mt-2 text-2xl text-paper">{vendor.name}</h1>
            {(vendor.address || vendor.area) && (
              <p className="mt-1 text-sm text-muted">
                {vendor.address ? `${vendor.address}, ` : ''}
                {vendor.area}
              </p>
            )}
          </div>
          <LogoutButton />
        </div>

        {!vendor.profileComplete ? (
          <div className="mt-6 rounded-[10px] border border-paprika/40 bg-paprika/10 px-5 py-4 text-sm text-paper">
            Finish setting up your kitchen profile before you can list meals.{' '}
            <a href="/vendor/dashboard/profile" className="font-semibold underline">
              Complete it now
            </a>
            .
          </div>
        ) : (
          vendor.status !== 'approved' && (
            <div className="mt-6 rounded-[10px] border border-paprika/40 bg-paprika/10 px-5 py-4 text-sm text-paper">
              {vendor.status === 'suspended'
                ? 'Your kitchen has been suspended. Contact onelitre support for details.'
                : 'Your kitchen is under review — it will appear on the public menu once approved. You can keep setting up your meals in the meantime.'}
            </div>
          )
        )}

        <VendorNav />
        <div className="mt-8">{children}</div>
      </div>
    </>
  );
}
