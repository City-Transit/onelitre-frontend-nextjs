import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type { Order, User } from '@/lib/types';
import { SiteHeader } from '@/components/site-header';
import LogoutButton from './logout-button';
import EditProfileForm from './edit-profile-form';
import { MyOrders } from './my-orders';
import { SubscriptionPanel } from './subscription-panel';

export default async function DashboardPage() {
  const res = await serverApiFetch('/auth/me');
  if (!res.ok) {
    redirect('/login');
  }
  const user: User = await res.json();

  const ordersRes = await serverApiFetch('/orders/me');
  const orders: Order[] = ordersRes.ok ? await ordersRes.json() : [];

  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
              Your account
            </div>
            <h1 className="mt-2 text-2xl text-paper">Welcome back, {user.firstName}.</h1>
          </div>
          <LogoutButton />
        </div>
        <div className="mt-8 rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
          <EditProfileForm user={user} />
        </div>
        <SubscriptionPanel />
        <div className="mt-8">
          <h2 className="mb-4 text-xl text-paper">Your orders</h2>
          <div className="rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
            <MyOrders orders={orders} />
          </div>
        </div>
      </div>
    </>
  );
}
