'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { DASHBOARD_BY_ROLE } from '@/lib/dashboard-routes';
import { ActiveOrdersBadge } from './active-orders-badge';
import { BasketButton } from './basket-button';
import { ViewKitchensLink } from './view-kitchens-link';
import type { User } from '@/lib/types';

/** Collapses the header's nav links behind a toggle below the `sm` breakpoint — the plain flex
 * row (see site-header.tsx) wraps and overlaps the logo once there are more than ~3 links. */
export function MobileNav({
  user,
  activeOrderCount,
}: {
  user: User | null;
  activeOrderCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="px-1 py-1 font-mono text-xl text-paper"
      >
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full flex flex-col gap-4 border-b border-line bg-bg px-6 py-5 font-mono text-[13px]">
          <Suspense fallback={null}>
            <ViewKitchensLink />
          </Suspense>
          <ActiveOrdersBadge count={activeOrderCount} />
          <BasketButton />
          {user ? (
            <Link
              href={DASHBOARD_BY_ROLE[user.role]}
              onClick={() => setOpen(false)}
              className="w-fit rounded-[3px] bg-paprika px-4 py-2.5 font-bold text-ink transition-all hover:-translate-y-px hover:bg-[#EA8A3E]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/vendors"
                onClick={() => setOpen(false)}
                className="text-paper transition-colors hover:text-frost"
              >
                For kitchens
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-paper transition-colors hover:text-frost"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="w-fit rounded-[3px] bg-paprika px-4 py-2.5 font-bold text-ink transition-all hover:-translate-y-px hover:bg-[#EA8A3E]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
