import { notFound } from 'next/navigation';
import { Reviews } from './reviews';
import { VendorMenu } from './vendor-menu';
import { BasketSavingsBanner } from '@/components/basket-savings-banner';
import { API_BASE_URL } from '@/lib/api-base-url';
import {
  formatRatingCount,
  getDeliveryTimeBucket,
  getEstimatedDeliveryMinutes,
} from '@/lib/vendor-options';
import type { Vendor } from '@/lib/types';

async function getVendor(id: string): Promise<Vendor | null> {
  const res = await fetch(`${API_BASE_URL}/vendors/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const vendor = await getVendor(vendorId);
  if (!vendor) notFound();

  const totalMinutes = getEstimatedDeliveryMinutes(vendor);
  const deliveryBucket = totalMinutes != null ? getDeliveryTimeBucket(totalMinutes) : null;
  const mealCount = vendor.meals.length;
  const hasBadges = vendor.certifiedAt || (vendor.badges && vendor.badges.length > 0);

  return (
    <section className="px-6 pb-24 pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
          {vendor.area}
        </div>
        <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.08] text-paper">{vendor.name}</h1>
        {vendor.address && <p className="mt-2 text-sm text-muted">{vendor.address}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-line py-5">
          {vendor.ratingCount ? (
            <div>
              <div className="font-serif text-xl text-paper">
                ★ {vendor.ratingAverage?.toFixed(1)}
              </div>
              <div className="font-mono text-xs text-muted">
                {formatRatingCount(vendor.ratingCount)} review
                {vendor.ratingCount === 1 ? '' : 's'}
              </div>
            </div>
          ) : null}
          {deliveryBucket && (
            <div>
              <div className="font-serif text-xl text-paper">{deliveryBucket.label}</div>
              <div className="font-mono text-xs text-muted">Estimated delivery</div>
            </div>
          )}
          <div>
            <div className="font-serif text-xl text-paper">{mealCount}</div>
            <div className="font-mono text-xs text-muted">{mealCount === 1 ? 'meal' : 'meals'}</div>
          </div>
          {hasBadges && (
            <div className="flex flex-wrap gap-1.5">
              {vendor.certifiedAt && (
                <span className="rounded-full bg-frost/15 px-2.5 py-1 font-mono text-[11px] text-frost">
                  Certified
                </span>
              )}
              {vendor.badges?.map((b) => (
                <span
                  key={b.id}
                  className="rounded-full bg-paprika/15 px-2.5 py-1 font-mono text-[11px] text-paprika"
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="lg:hidden">
          <BasketSavingsBanner meals={vendor.meals} />
        </div>

        <VendorMenu vendor={vendor} />

        <Reviews vendorId={vendor.id} />
      </div>
    </section>
  );
}
