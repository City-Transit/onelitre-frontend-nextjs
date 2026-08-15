import Link from 'next/link';
import { Suspense } from 'react';
import { serverApiFetch } from '@/lib/server-api';
import { DASHBOARD_BY_ROLE } from '@/lib/dashboard-routes';
import { BasketButton } from './basket-button';
import { MobileNav } from './mobile-nav';
import { ViewKitchensLink } from './view-kitchens-link';
import type { User } from '@/lib/types';

export async function SiteHeader() {
  const res = await serverApiFetch('/auth/me');
  const user: User | null = res.ok ? await res.json() : null;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5 font-serif text-lg font-semibold">
          <span className="inline-block h-[9px] w-[9px] rounded-full bg-paprika shadow-[0_0_0_3px_rgba(217,118,43,0.25)]" />
          Onelitre.ng
        </Link>
        <MobileNav user={user} />
        <nav className="hidden items-center gap-5 font-mono text-[13px] sm:flex">
          <Suspense fallback={null}>
            <ViewKitchensLink />
          </Suspense>
          <BasketButton />
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
                For kitchens
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
