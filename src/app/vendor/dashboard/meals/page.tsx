import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serverApiFetch } from '@/lib/server-api';
import type { Vendor } from '@/lib/types';
import { MealsPanel } from './meals-panel';

export default async function VendorMealsPage() {
  const res = await serverApiFetch('/vendor/profile');
  if (!res.ok) {
    redirect('/login');
  }
  const vendor: Vendor = await res.json();

  return (
    <div>
      <h2 className="mb-4 text-xl text-paper">Meals</h2>
      {vendor.profileComplete ? (
        <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <MealsPanel initialMeals={vendor.meals} />
        </div>
      ) : (
        <div className="rounded-[20px] bg-paper p-8 text-center text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <p className="text-sm text-[#5B6B63]">
            Finish setting up your kitchen profile before you can list meals.
          </p>
          <Link
            href="/vendor/dashboard/profile"
            className="mt-4 inline-block rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white hover:bg-paprika"
          >
            Complete your profile
          </Link>
        </div>
      )}
    </div>
  );
}
