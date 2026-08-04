'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { MealSize } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function MealApprovalsTable({ initialMeals }: { initialMeals: MealSize[] }) {
  const [meals, setMeals] = useState(initialMeals);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  async function approve(mealId: string) {
    setBusyId(mealId);
    setErrorById((prev) => ({ ...prev, [mealId]: '' }));
    try {
      await apiFetch(`/admin/meals/${mealId}/approve`, { method: 'PATCH' });
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [mealId]:
          err instanceof ApiError ? err.message : 'Something went wrong approving this meal.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function reject(mealId: string) {
    const reason = reasonById[mealId]?.trim();
    if (!reason) {
      setErrorById((prev) => ({ ...prev, [mealId]: 'A rejection reason is required.' }));
      return;
    }
    setBusyId(mealId);
    setErrorById((prev) => ({ ...prev, [mealId]: '' }));
    try {
      await apiFetch(`/admin/meals/${mealId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
    } catch (err) {
      setErrorById((prev) => ({
        ...prev,
        [mealId]:
          err instanceof ApiError ? err.message : 'Something went wrong rejecting this meal.',
      }));
    } finally {
      setBusyId(null);
    }
  }

  if (meals.length === 0) {
    return (
      <div className="rounded-[20px] bg-paper p-8 text-center text-sm text-[#5B6B63] shadow-[0_24px_60px_rgba(18,33,29,0.35)]">
        No meals pending approval.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {meals.map((meal) => (
        <div
          key={meal.id}
          className="rounded-[20px] bg-paper p-6 text-ink shadow-[0_24px_60px_rgba(18,33,29,0.35)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#8A8073]">
                {meal.vendor?.name ?? 'Unknown vendor'}
              </div>
              <h3 className="mt-1 text-lg font-semibold">{meal.name}</h3>
              {meal.description && (
                <p className="mt-1 text-sm text-[#5B6B63]">{meal.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#5B6B63]">
                <span className="rounded-full bg-paper-dim px-2.5 py-1">
                  {meal.litres}L · {naira(meal.price)}
                </span>
              </div>
              <div className="mt-2 text-xs">
                {meal.imageUrl ? (
                  <span className="text-green-700">Photo uploaded</span>
                ) : meal.photoRequested ? (
                  <span className="text-paprika-dim">Onelitre photography requested</span>
                ) : (
                  <span className="text-red-700">No photo — cannot be approved</span>
                )}
              </div>
            </div>
            {meal.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="h-20 w-28 rounded-[10px] object-cover"
              />
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => approve(meal.id)}
              disabled={busyId === meal.id}
              className="rounded-full bg-paprika-dim px-4 py-2 text-xs font-semibold text-white hover:bg-paprika disabled:opacity-60"
            >
              Approve
            </button>
            <input
              placeholder="Rejection reason"
              value={reasonById[meal.id] ?? ''}
              onChange={(e) =>
                setReasonById((prev) => ({ ...prev, [meal.id]: e.target.value }))
              }
              className="rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2 text-xs"
            />
            <button
              onClick={() => reject(meal.id)}
              disabled={busyId === meal.id}
              className="rounded-full border border-red-700/30 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
            >
              Reject
            </button>
          </div>
          {errorById[meal.id] && (
            <p className="mt-2 text-xs text-red-700">{errorById[meal.id]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
