'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { uploadMealPhoto } from '@/lib/cloudinary-upload';
import { servingsForLitres } from '@/lib/meal-size-presets';
import { CUISINE_OPTIONS, DIETARY_TAGS } from '@/lib/vendor-options';
import type { MealSize } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const APPROVAL_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending review', className: 'bg-paper-dim text-[#5B6B63]' },
  approved: { label: 'Live', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2.5 text-[14px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

interface MealDraft {
  name: string;
  description: string;
  litres: string;
  price: string;
  note: string;
  cuisine: string;
  dietaryTags: string[];
  photoRequested: boolean;
}

function emptyDraft(): MealDraft {
  return {
    name: '',
    description: '',
    litres: '',
    price: '',
    note: '',
    cuisine: '',
    dietaryTags: [],
    photoRequested: false,
  };
}

function draftFromMeal(meal: MealSize): MealDraft {
  return {
    name: meal.name,
    description: meal.description ?? '',
    litres: String(meal.litres),
    price: String(meal.price),
    note: meal.note ?? '',
    cuisine: meal.cuisine ?? '',
    dietaryTags: meal.dietaryTags ?? [],
    photoRequested: meal.photoRequested ?? false,
  };
}

/** The shared field set for both "Add a meal" and the inline per-meal edit form — kept as one
 * component so the two never drift apart. */
function MealFields({
  draft,
  onChange,
  file,
  onFileChange,
  fileInputKey,
  photoLabel,
  photoHint,
}: {
  draft: MealDraft;
  onChange: (patch: Partial<MealDraft>) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  fileInputKey: number;
  photoLabel: string;
  photoHint?: string;
}) {
  const litresValue = Number(draft.litres);
  const hasValidLitres = draft.litres !== '' && litresValue > 0;

  function toggleDietaryTag(tag: string) {
    onChange({
      dietaryTags: draft.dietaryTags.includes(tag)
        ? draft.dietaryTags.filter((t) => t !== tag)
        : [...draft.dietaryTags, tag],
    });
  }

  return (
    <>
      <div className="flex gap-4">
        <div className="w-full">
          <label className="text-sm font-semibold">Name</label>
          <input
            required
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div className="w-full">
          <label className="text-sm font-semibold">{photoLabel}</label>
          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            disabled={draft.photoRequested}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm text-[#5B6B63] file:mr-3 file:rounded-full file:border-0 file:bg-paprika-dim file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-paprika disabled:opacity-50 disabled:file:bg-[#5B6B63]"
          />
          {photoHint && !file && (
            <p className="mt-1 text-xs text-[#8A8073]">{photoHint}</p>
          )}
          <label className="mt-1.5 flex items-center gap-1.5 text-xs text-[#5B6B63]">
            <input
              type="checkbox"
              checked={draft.photoRequested}
              disabled={!!file}
              onChange={(e) => onChange({ photoRequested: e.target.checked })}
            />
            Request Onelitre photography instead (flat fee, handled separately)
          </label>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Description (optional)</label>
        <input
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={`${inputClass} mt-1`}
        />
      </div>
      <div>
        <label className="text-sm font-semibold">Size &amp; price</label>
        <div className="mt-2 flex items-center gap-2">
          <input
            required
            type="number"
            step="0.1"
            min="0.1"
            placeholder="Litres"
            value={draft.litres}
            onChange={(e) => onChange({ litres: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="number"
            placeholder="Price (₦)"
            value={draft.price}
            onChange={(e) => onChange({ price: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Note (optional)"
            value={draft.note}
            onChange={(e) => onChange({ note: e.target.value })}
            className={inputClass}
          />
          <span className="w-24 shrink-0 whitespace-nowrap text-xs text-[#5B6B63]">
            {hasValidLitres ? `${servingsForLitres(litresValue)} meals` : ''}
          </span>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold">Cuisine (optional)</label>
        <select
          value={draft.cuisine}
          onChange={(e) => onChange({ cuisine: e.target.value })}
          className={`${inputClass} mt-1`}
        >
          <option value="">No specific cuisine</option>
          {CUISINE_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-[#8A8073]">
          Only needed if this dish doesn&apos;t match your kitchen&apos;s usual cuisine.
        </p>
      </div>
      <div>
        <label className="text-sm font-semibold">Dietary tags (optional)</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DIETARY_TAGS.map((tag) => {
            const active = draft.dietaryTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleDietaryTag(tag)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-paprika bg-paprika text-white'
                    : 'border-[rgba(18,33,29,0.14)] bg-paper-dim text-[#5B6B63]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-[#8A8073]">
          Self-declared — pick as many as apply to this specific dish.
        </p>
      </div>
    </>
  );
}

export function MealsPanel({ initialMeals }: { initialMeals: MealSize[] }) {
  const router = useRouter();
  const [meals, setMeals] = useState(initialMeals);

  const [draft, setDraft] = useState<MealDraft>(emptyDraft());
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<MealDraft>(emptyDraft());
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFileInputKey, setEditFileInputKey] = useState(0);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function updateDraft(patch: Partial<MealDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function handleCreateMeal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await uploadMealPhoto(file);
      }
      const meal: MealSize = await apiFetch('/vendor/meals', {
        method: 'POST',
        body: JSON.stringify({
          name: draft.name,
          description: draft.description || undefined,
          imageUrl,
          photoRequested: !imageUrl && draft.photoRequested ? true : undefined,
          litres: Number(draft.litres),
          price: Number(draft.price),
          note: draft.note || undefined,
          cuisine: draft.cuisine || undefined,
          dietaryTags: draft.dietaryTags.length > 0 ? draft.dietaryTags : undefined,
        }),
      });
      setMeals((prev) => [...prev, meal]);
      setDraft(emptyDraft());
      setFile(null);
      setFileInputKey((k) => k + 1);
      router.refresh();
    } catch {
      setError('Could not save meal. Please check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAvailable(meal: MealSize) {
    const updated: MealSize = await apiFetch(`/vendor/meals/${meal.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ available: !meal.available }),
    });
    setMeals((prev) => prev.map((m) => (m.id === meal.id ? { ...m, ...updated } : m)));
  }

  async function deleteMeal(mealId: string) {
    await apiFetch(`/vendor/meals/${mealId}`, { method: 'DELETE' });
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  }

  function startEdit(meal: MealSize) {
    setEditingId(meal.id);
    setEditDraft(draftFromMeal(meal));
    setEditFile(null);
    setEditFileInputKey((k) => k + 1);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  /** Diffs against the meal's current values so an edit that doesn't actually change anything
   * (e.g. opening the form and just hitting Save) never re-sends the meal for admin review —
   * only a real content change should cost the kitchen its Live status. */
  async function saveEdit(meal: MealSize) {
    setEditError(null);
    setEditSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (editFile) {
        imageUrl = await uploadMealPhoto(editFile);
      }

      const patch: Record<string, unknown> = {};
      if (editDraft.name !== meal.name) patch.name = editDraft.name;
      if (editDraft.description !== (meal.description ?? '')) {
        patch.description = editDraft.description || undefined;
      }
      if (imageUrl) patch.imageUrl = imageUrl;
      const photoRequestedChanged =
        editDraft.photoRequested !== (meal.photoRequested ?? false);
      if (!imageUrl && photoRequestedChanged) {
        patch.photoRequested = editDraft.photoRequested;
      }
      if (Number(editDraft.litres) !== meal.litres) patch.litres = Number(editDraft.litres);
      if (Number(editDraft.price) !== meal.price) patch.price = Number(editDraft.price);
      if (editDraft.note !== (meal.note ?? '')) patch.note = editDraft.note || undefined;
      if (editDraft.cuisine !== (meal.cuisine ?? '')) {
        patch.cuisine = editDraft.cuisine || undefined;
      }
      const originalTags = meal.dietaryTags ?? [];
      const tagsChanged =
        editDraft.dietaryTags.length !== originalTags.length ||
        editDraft.dietaryTags.some((t) => !originalTags.includes(t));
      if (tagsChanged) patch.dietaryTags = editDraft.dietaryTags;

      if (Object.keys(patch).length === 0) {
        setEditingId(null);
        return;
      }

      const updated: MealSize = await apiFetch(`/vendor/meals/${meal.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setMeals((prev) => prev.map((m) => (m.id === meal.id ? { ...m, ...updated } : m)));
      setEditingId(null);
      router.refresh();
    } catch {
      setEditError('Could not save changes. Please check the fields and try again.');
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleCreateMeal}
        className="flex flex-col gap-4 rounded-[16px] border border-[rgba(18,33,29,0.14)] p-6"
      >
        <h3 className="text-lg font-semibold">Add a meal</h3>
        <MealFields
          draft={draft}
          onChange={updateDraft}
          file={file}
          onFileChange={setFile}
          fileInputKey={fileInputKey}
          photoLabel="Photo (required to go live)"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-full bg-paprika-dim px-5 py-2.5 font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
        >
          {submitting ? 'Saving…' : 'Add meal'}
        </button>
      </form>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Your meals ({meals.length})</h3>
        {meals.length === 0 && (
          <p className="text-sm text-[#5B6B63]">No meals yet — add your first one above.</p>
        )}
        {meals.map((meal) => {
          if (editingId === meal.id) {
            return (
              <div
                key={meal.id}
                className="flex flex-col gap-4 rounded-[16px] border border-paprika/40 p-4"
              >
                <h4 className="font-semibold">Edit meal</h4>
                <MealFields
                  draft={editDraft}
                  onChange={(patch) => setEditDraft((prev) => ({ ...prev, ...patch }))}
                  file={editFile}
                  onFileChange={setEditFile}
                  fileInputKey={editFileInputKey}
                  photoLabel="Photo"
                  photoHint={
                    meal.imageUrl ? 'Current photo will be kept unless you choose a new one.' : undefined
                  }
                />
                <p className="text-xs text-[#8A8073]">
                  Saving a change sends this dish back for admin review — it stays live under its
                  current listing until that review is done.
                </p>
                {editError && <p className="text-sm text-red-700">{editError}</p>}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveEdit(meal)}
                    disabled={editSubmitting}
                    className="rounded-full bg-paprika-dim px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-paprika disabled:opacity-65"
                  >
                    {editSubmitting ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={editSubmitting}
                    className="rounded-full border border-[rgba(18,33,29,0.2)] px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={meal.id}
              className="flex gap-4 rounded-[16px] border border-[rgba(18,33,29,0.14)] p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-paper-dim">
                {meal.imageUrl && (
                  <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{meal.name}</h4>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        APPROVAL_LABEL[meal.approvalStatus ?? 'pending'].className
                      }`}
                    >
                      {APPROVAL_LABEL[meal.approvalStatus ?? 'pending'].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={meal.available !== false}
                        onChange={() => toggleAvailable(meal)}
                      />
                      Available
                    </label>
                    <button
                      onClick={() => startEdit(meal)}
                      className="font-semibold text-ink underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMeal(meal.id)}
                      className="font-semibold text-red-700 underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {meal.approvalStatus === 'rejected' && meal.rejectionReason && (
                  <p className="mt-1 text-sm text-red-700">Rejected: {meal.rejectionReason}</p>
                )}
                {meal.description && (
                  <p className="text-sm text-[#5B6B63]">{meal.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-paper-dim px-3 py-1 font-mono text-xs">
                    {meal.litres}L · {meal.servings} meals · {naira(meal.price)}
                  </span>
                  {meal.cuisine && (
                    <span className="rounded-full bg-paper-dim px-3 py-1 font-mono text-xs">
                      {meal.cuisine}
                    </span>
                  )}
                </div>
                {meal.dietaryTags && meal.dietaryTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {meal.dietaryTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-frost/15 px-2.5 py-0.5 text-xs text-frost"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
