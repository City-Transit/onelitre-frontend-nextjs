import { MenuBrowser } from './menu-browser';
import type { Vendor } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getVendors(): Promise<Vendor[]> {
  const res = await fetch(`${API_BASE_URL}/vendors`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function MenuPage() {
  const vendors = await getVendors();

  return (
    <section className="px-6 pb-24 pt-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
          <span className="h-px w-[22px] bg-frost" />
          Pilot batch — Lagos delivery only
        </div>
        <h1 className="text-[clamp(32px,4.4vw,50px)] leading-[1.08] text-paper">
          Pick your kitchen for this batch.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          A small first run of bulk, freezer-ready packs from our vetted vendors. Browse a
          kitchen or search for a dish — pay only when it arrives at your door.
        </p>

        <MenuBrowser vendors={vendors} />
      </div>
    </section>
  );
}
