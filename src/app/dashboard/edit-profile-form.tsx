'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { User } from '@/lib/types';

const inputClass =
  'mt-1 w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-4 py-[15px] text-[15px] text-ink focus:border-paprika focus:bg-white focus:shadow-[0_0_0_3px_rgba(217,118,43,0.14)] focus:outline-none';

export default function EditProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [address, setAddress] = useState(user.address ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await apiFetch('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ firstName, lastName, address }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="text-[14.5px] font-semibold text-[#5B6B63]">Phone number</label>
        <input
          disabled
          value={user.phone ?? ''}
          className="mt-1 w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-[#E7DFCE] px-4 py-[15px] text-[15px] text-[#5B6B63]"
        />
      </div>
      <div className="flex gap-4">
        <div className="w-full">
          <label className="text-[14.5px] font-semibold">First name</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="w-full">
          <label className="text-[14.5px] font-semibold">Last name</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="text-[14.5px] font-semibold">Address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-paprika-dim px-5 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-paprika disabled:translate-y-0 disabled:opacity-65"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-sm text-[#2f6d4f]">Saved.</span>}
      </div>
    </form>
  );
}
