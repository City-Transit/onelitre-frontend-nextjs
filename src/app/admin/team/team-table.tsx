'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { User } from '@/lib/types';

const ROLE_LABEL: Record<string, string> = {
  staff: 'Staff',
  supervisor: 'Supervisor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export function TeamTable({
  initialMembers,
  currentUserId,
  canDeactivate,
}: {
  initialMembers: User[];
  currentUserId: string;
  canDeactivate: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setActive(memberId: string, isActive: boolean) {
    setBusyId(memberId);
    await apiFetch(`/admin/team/${memberId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, isActive } : m)));
    setBusyId(null);
  }

  if (members.length === 0) {
    return (
      <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        No team members yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[20px] bg-paper text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
      <table className="w-full text-left text-sm">
        <thead className="font-mono text-xs uppercase tracking-wide text-[#5B6B63]">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Joined</th>
            {canDeactivate && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const isActive = member.isActive !== false;
            const isSelf = member.id === currentUserId;
            const isSuperAdmin = member.role === 'super_admin';
            return (
              <tr key={member.id} className="border-t border-[rgba(18,33,29,0.1)]">
                <td className="px-6 py-4 font-semibold">
                  {member.firstName} {member.lastName}
                  {isSelf && <span className="ml-2 text-xs font-normal text-[#8A8073]">(you)</span>}
                </td>
                <td className="px-6 py-4 font-mono text-[#5B6B63]">{member.email ?? '—'}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold">
                    {ROLE_LABEL[member.role] ?? member.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive ? 'bg-paper-dim' : 'bg-red-700/10 text-red-700'
                    }`}
                  >
                    {isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-[#5B6B63]">
                  {formatDate(member.createdAt)}
                </td>
                {canDeactivate && (
                  <td className="px-6 py-4 text-right">
                    {isSelf || isSuperAdmin ? (
                      <span className="text-xs text-[#8A8073]">—</span>
                    ) : isActive ? (
                      <button
                        onClick={() => setActive(member.id, false)}
                        disabled={busyId === member.id}
                        className="rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-60"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => setActive(member.id, true)}
                        disabled={busyId === member.id}
                        className="rounded-full bg-paprika-dim px-3 py-1.5 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
