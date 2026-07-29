'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/types';

const ADMIN_UP: Role[] = ['admin', 'super_admin'];

const TABS = [
  { href: '/admin/vendors', label: 'Vendors' },
  { href: '/admin/menu-approvals', label: 'Menu Approvals' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/payouts', label: 'Payouts' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/activity', label: 'Activity', minRole: ADMIN_UP },
  { href: '/admin/team', label: 'Team', minRole: ADMIN_UP },
  { href: '/admin/delivery-fees', label: 'Delivery Fees', minRole: ADMIN_UP },
];

export function AdminNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const visibleTabs = TABS.filter((tab) => !tab.minRole || tab.minRole.includes(role));

  return (
    <div className="mt-6 flex gap-1 border-b border-line font-mono text-[13px]">
      {visibleTabs.map((tab) => {
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
