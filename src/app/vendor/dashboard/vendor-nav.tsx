'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/vendor/dashboard/profile', label: 'Profile' },
  { href: '/vendor/dashboard/meals', label: 'Meals' },
  { href: '/vendor/dashboard/orders', label: 'Orders' },
  { href: '/vendor/dashboard/sales', label: 'Sales' },
  { href: '/vendor/dashboard/activity', label: 'Activity' },
];

export function VendorNav() {
  const pathname = usePathname();

  return (
    <div className="mt-6 flex gap-1 border-b border-line font-mono text-[13px]">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 font-semibold transition-colors ${
              active ? 'border-b-2 border-paprika text-paper' : 'text-muted hover:text-paper'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
