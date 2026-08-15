'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

/** On the plain /menu page there's nothing to link to (you're already there), so this hides
 * itself. With an active ?area= filter (see hero-city-picker.tsx / menu-browser.tsx), the same
 * link instead offers to clear it, since /menu with no query params is the "show everything"
 * view. Everywhere else (including individual vendor pages under /menu/*) it's a normal link. */
export function ViewKitchensLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onMenuPage = pathname === '/menu';
  const hasAreaFilter = Boolean(searchParams.get('area'));

  if (onMenuPage && !hasAreaFilter) return null;

  return (
    <Link href="/menu" className="text-paper transition-colors hover:text-frost">
      {onMenuPage && hasAreaFilter ? 'Clear filter' : 'View kitchens'}
    </Link>
  );
}
