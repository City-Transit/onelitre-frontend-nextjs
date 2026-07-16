import Link from 'next/link';
import { serverApiFetch } from '@/lib/server-api';
import type { User } from '@/lib/types';

const DASHBOARD_BY_ROLE: Record<User['role'], string> = {
  customer: '/dashboard',
  vendor: '/vendor/dashboard',
  staff: '/admin',
  supervisor: '/admin',
  admin: '/admin',
  super_admin: '/admin',
};

export async function SiteHeader() {
  const res = await serverApiFetch('/auth/me');
  const user: User | null = res.ok ? await res.json() : null;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 font-serif text-lg font-semibold">
          <span className="inline-block h-[9px] w-[9px] rounded-full bg-paprika shadow-[0_0_0_3px_rgba(217,118,43,0.25)]" />
          Onelitre.ng
        </Link>
        <nav className="flex items-center gap-5 font-mono text-[13px]">
          <Link href="/menu" className="text-paper transition-colors hover:text-frost">
            View menu
          </Link>
          {user ? (
            <Link
              href={DASHBOARD_BY_ROLE[user.role]}
              className="rounded-[3px] bg-paprika px-4 py-2.5 font-bold text-ink transition-all hover:-translate-y-px hover:bg-[#EA8A3E]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/vendors" className="text-paper transition-colors hover:text-frost">
                Vendors
              </Link>
              <Link href="/login" className="text-paper transition-colors hover:text-frost">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-[3px] bg-paprika px-4 py-2.5 font-bold text-ink transition-all hover:-translate-y-px hover:bg-[#EA8A3E]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
