import { redirect } from 'next/navigation';
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
      <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        <MealsPanel initialMeals={vendor.meals} />
      </div>
    </div>
  );
}
