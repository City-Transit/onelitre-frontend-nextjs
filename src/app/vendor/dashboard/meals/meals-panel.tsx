'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { uploadMealPhoto } from '@/lib/cloudinary-upload';
import { servingsForLitres } from '@/lib/meal-size-presets';
import { DIETARY_TAGS } from '@/lib/vendor-options';
import type { MealSize } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const APPROVAL_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending review', className: 'bg-paper-dim text-[#5B6B63]' },
  approved: { label: 'Live', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2.5 text-[14px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

export function MealsPanel({ initialMeals }: { initialMeals: MealSize[] }) {
  const router = useRouter();
  const [meals, setMeals] = useState(initialMeals);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [photoRequested, setPhotoRequested] = useState(false);
  const [litres, setLitres] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [ownChannelPrice, setOwnChannelPrice] = useState('');
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const litresValue = Number(litres);
  const hasValidLitres = litres !== '' && litresValue > 0;

  function toggleDietaryTag(tag: string) {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
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
          name,
          description: description || undefined,
          imageUrl,
          photoRequested: !imageUrl && photoRequested ? true : undefined,
          litres: Number(litres),
          price: Number(price),
          note: note || undefined,
          ownChannelPrice: ownChannelPrice ? Number(ownChannelPrice) : undefined,
          dietaryTags: dietaryTags.length > 0 ? dietaryTags : undefined,
        }),
      });
      setMeals((prev) => [...prev, meal]);
      setName('');
      setDescription('');
      setFile(null);
      setPhotoRequested(false);
      setLitres('');
      setPrice('');
      setNote('');
      setOwnChannelPrice('');
      setDietaryTags([]);
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

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleCreateMeal}
        className="flex flex-col gap-4 rounded-[16px] border border-[rgba(18,33,29,0.14)] p-6"
      >
        <h3 className="text-lg font-semibold">Add a meal</h3>
        <div className="flex gap-4">
          <div className="w-full">
            <label className="text-sm font-semibold">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} mt-1`}
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-semibold">Photo (required to go live)</label>
            <input
              type="file"
              accept="image/*"
              disabled={photoRequested}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm disabled:opacity-50"
            />
            <label className="mt-1.5 flex items-center gap-1.5 text-xs text-[#5B6B63]">
              <input
                type="checkbox"
                checked={photoRequested}
                disabled={!!file}
                onChange={(e) => setPhotoRequested(e.target.checked)}
              />
              Request Onelitre photography instead (flat fee, handled separately)
            </label>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              value={litres}
              onChange={(e) => setLitres(e.target.value)}
              className={inputClass}
            />
            <input
              required
              type="number"
              placeholder="Price (₦)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              placeholder="Your own-channel price (₦, optional)"
              value={ownChannelPrice}
              onChange={(e) => setOwnChannelPrice(e.target.value)}
              className={inputClass}
            />
            <span className="w-24 shrink-0 whitespace-nowrap text-xs text-[#5B6B63]">
              {hasValidLitres ? `${servingsForLitres(litresValue)} meals` : ''}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8A8073]">
            Own-channel price is what you charge for this size on WhatsApp/in-person, if
            different — per your contract, we keep our price within 10% of it.
          </p>
        </div>
        <div>
          <label className="text-sm font-semibold">Dietary tags (optional)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => {
              const active = dietaryTags.includes(tag);
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
          const overParity =
            meal.ownChannelPrice != null && meal.price > meal.ownChannelPrice * 1.1;
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
                <div className="mt-2">
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs ${
                      overParity ? 'bg-red-100 text-red-700' : 'bg-paper-dim'
                    }`}
                    title={
                      overParity
                        ? `More than 10% above your own-channel price of ${naira(meal.ownChannelPrice!)}`
                        : undefined
                    }
                  >
                    {meal.litres}L · {meal.servings} meals · {naira(meal.price)}
                    {overParity ? ' ⚠' : ''}
                  </span>
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
