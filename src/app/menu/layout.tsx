import { SiteHeader } from '@/components/site-header';
import { CartProvider } from './cart-context';
import { CartBar } from './cart-bar';
import { Checkout } from './checkout';
import type { Vendor } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getVendors(): Promise<Vendor[]> {
  const res = await fetch(`${API_BASE_URL}/vendors`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function MenuLayout({ children }: { children: React.ReactNode }) {
  const vendors = await getVendors();

  return (
    <CartProvider>
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
