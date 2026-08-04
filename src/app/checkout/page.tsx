import { SiteHeader } from '@/components/site-header';
import { API_BASE_URL } from '@/lib/api-base-url';
import { serverApiFetch } from '@/lib/server-api';
import { CheckoutForm } from './checkout-form';
import type { User, Vendor } from '@/lib/types';

async function getVendors(): Promise<Vendor[]> {
  const res = await fetch(`${API_BASE_URL}/vendors`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getCurrentUser(): Promise<User | null> {
  const res = await serverApiFetch('/auth/me');
  return res.ok ? res.json() : null;
}

export default async function CheckoutPage() {
  const [vendors, user] = await Promise.all([getVendors(), getCurrentUser()]);

  return (
    <>
      <SiteHeader />
      <CheckoutForm vendors={vendors} user={user} />
      <footer className="border-t border-line bg-bg-alt px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2.5 font-serif text-[17px] font-semibold">
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-paprika" />
            Onelitre.ng
          </div>
          <div className="font-mono text-xs text-muted">hello@onelitre.ng · Lagos, Nigeria</div>
        </div>
      </footer>
    </>
  );
}
