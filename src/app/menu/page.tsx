import { MenuBrowser } from './menu-browser';
import { API_BASE_URL } from '@/lib/api-base-url';
import type { Badge, Vendor } from '@/lib/types';

async function getVendors(): Promise<Vendor[]> {
  const res = await fetch(`${API_BASE_URL}/vendors`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getBadges(): Promise<Badge[]> {
  const res = await fetch(`${API_BASE_URL}/vendors/badges`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function MenuPage() {
  const [vendors, badges] = await Promise.all([getVendors(), getBadges()]);

  return (
    <section className="px-6 pb-24 pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
          <span className="h-px w-[22px] bg-frost" />
          Pilot batch — Lagos delivery only
        </div>
        <h1 className="text-[clamp(32px,4.4vw,50px)] leading-[1.08] text-paper">
          Pick your kitchen for this batch.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          A small first run of bulk, freezer-ready packs from our vetted kitchens. Browse a
          kitchen or search for a dish, then pay securely at checkout.
        </p>

        <MenuBrowser vendors={vendors} badges={badges} />
      </div>
    </section>
  );
}
