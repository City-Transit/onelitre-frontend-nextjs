import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/server-api';
import type { User } from '@/lib/types';
import { SiteHeader } from '@/components/site-header';
import LogoutButton from '../dashboard/logout-button';
import { AdminNav } from './admin-nav';

const ADMIN_SIDE_ROLES: User['role'][] = ['staff', 'supervisor', 'admin', 'super_admin'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const res = await serverApiFetch('/auth/me');
  if (!res.ok) {
    redirect('/login');
  }
  const user: User = await res.json();
  if (!ADMIN_SIDE_ROLES.includes(user.role)) {
    redirect('/login');
  }

  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[12.5px] uppercase tracking-[0.14em] text-frost">
              Admin
            </div>
            <h1 className="mt-2 text-2xl text-paper">Operations</h1>
          </div>
          <LogoutButton />
        </div>
        <AdminNav role={user.role} />
        <div className="mt-8">{children}</div>
      </div>
    </>
  );
}
