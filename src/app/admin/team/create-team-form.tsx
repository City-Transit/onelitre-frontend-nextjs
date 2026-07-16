'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import type { Role } from '@/lib/types';

const CREATABLE_ROLES: Partial<Record<Role, Role[]>> = {
  super_admin: ['admin', 'supervisor', 'staff'],
  admin: ['supervisor', 'staff'],
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  staff: 'Staff',
};

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-3 text-[15px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

export function CreateTeamForm({ viewerRole }: { viewerRole: Role }) {
  const router = useRouter();
  const assignableRoles = CREATABLE_ROLES[viewerRole] ?? [];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>(assignableRoles[0] ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (assignableRoles.length === 0) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch('/admin/team', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'That email is already registered.'
          : 'Could not create the account. Please check the fields and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 flex flex-col gap-4 rounded-[20px] bg-paper p-8 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]"
    >
      <h3 className="text-lg font-semibold">Add a team member</h3>
      <div className="flex gap-4">
        <div className="w-full">
          <label className="text-sm font-semibold">First name</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div className="w-full">
          <label className="text-sm font-semibold">Last name</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-full">
          <label className="text-sm font-semibold">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div className="w-full">
          <label className="text-sm font-semibold">Role</label>
          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`${inputClass} mt-1`}
          >
            {assignableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Password</label>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
      >
        {submitting ? 'Creating…' : 'Create account'}
      </button>
    </form>
  );
}
