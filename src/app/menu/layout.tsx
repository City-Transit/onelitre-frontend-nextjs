import { SiteHeader } from '@/components/site-header';
import { serverApiFetch } from '@/lib/server-api';
import { API_BASE_URL } from '@/lib/api-base-url';
import { CartProvider } from './cart-context';
import { CartBar } from './cart-bar';
import { Checkout } from './checkout';
import type { Vendor } from '@/lib/types';

async function getVendors(): Promise<Vendor[]> {
  const res = await fetch(`${API_BASE_URL}/vendors`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getCurrentUserId(): Promise<string | null> {
  const res = await serverApiFetch('/auth/me');
  if (!res.ok) return null;
  const user: { id: string } = await res.json();
  return user.id;
}

export default async function MenuLayout({ children }: { children: React.ReactNode }) {
  const [vendors, userId] = await Promise.all([getVendors(), getCurrentUserId()]);

  return (
    <CartProvider userId={userId}>
      <SiteHeader />

      {children}

      <Checkout vendors={vendors} />

      <footer className="border-t border-line bg-bg-alt px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2.5 font-serif text-[17px] font-semibold">
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-paprika" />
            Onelitre.ng
          </div>
          <div className="font-mono text-xs text-muted">hello@onelitre.ng · Lagos, Nigeria</div>
        </div>
      </footer>

      <CartBar vendors={vendors} />
    </CartProvider>
  );
}
