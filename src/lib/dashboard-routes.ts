import type { User } from '@/lib/types';

export const DASHBOARD_BY_ROLE: Record<User['role'], string> = {
  customer: '/dashboard',
  vendor: '/vendor/dashboard',
  staff: '/admin',
  supervisor: '/admin',
  admin: '/admin',
  super_admin: '/admin',
};
