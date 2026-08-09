import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';

export default function VendorsPage() {
  return (
    <>
      <SiteHeader />
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex items-center justify-center gap-2.5 font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
            <span className="h-px w-[22px] bg-frost" />
            For kitchens &amp; caterers
          </div>
          <h1 className="text-[clamp(32px,4.4vw,50px)] leading-[1.08] text-paper">
            Sell your meals on Onelitre.ng.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted">
            List your kitchen, set your own prices, and reach customers looking for bulk,
            freezer-ready meals. Onelitre handles delivery — you just cook and mark orders
            ready when they&apos;re packed.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/register?role=vendor"
              className="inline-flex items-center gap-2.5 rounded-[3px] bg-paprika px-6 py-4 font-mono text-[13.5px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#EA8A3E]"
            >
              List your kitchen
            </Link>
            <Link
              href="/login?role=vendor"
              className="inline-flex items-center gap-2.5 rounded-[3px] border border-line px-6 py-4 font-mono text-[13.5px] font-bold text-paper transition-all hover:-translate-y-0.5 hover:border-frost hover:text-frost"
            >
              Kitchen login
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-bg-alt px-6 py-20">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          <div>
            <div className="font-mono text-[13px] text-frost">01</div>
            <h3 className="mt-3 text-xl font-medium text-paper">List your kitchen</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              Sign up, add your meals with sizes, prices and photos. We review every new
              kitchen before it goes live.
            </p>
          </div>
          <div>
            <div className="font-mono text-[13px] text-frost">02</div>
            <h3 className="mt-3 text-xl font-medium text-paper">Get orders</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              Customers order bulk packs from your dashboard — no marketing or delivery
              logistics on your end.
            </p>
          </div>
          <div>
            <div className="font-mono text-[13px] text-frost">03</div>
            <h3 className="mt-3 text-xl font-medium text-paper">Mark it ready</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              Prep the order, mark it ready in your dashboard, and onelitre handles pickup
              and delivery.
            </p>
          </div>
        </div>
      </section>

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
