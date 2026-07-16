'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { uploadMealPhoto } from '@/lib/cloudinary-upload';
import { servingsForLitres } from '@/lib/meal-size-presets';
import type { Meal } from '@/lib/types';

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

const inputClass =
  'w-full rounded-[10px] border border-[rgba(18,33,29,0.14)] bg-paper-dim px-3 py-2.5 text-[14px] text-ink focus:border-paprika focus:bg-white focus:outline-none';

interface SizeDraft {
  litres: string;
  price: string;
  note: string;
}

export function MealsPanel({ initialMeals }: { initialMeals: Meal[] }) {
  const router = useRouter();
  const [meals, setMeals] = useState(initialMeals);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState<SizeDraft[]>([{ litres: '', price: '', note: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSize(i: number, field: keyof SizeDraft, value: string) {
    setSizes((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
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
      const meal: Meal = await apiFetch('/vendor/meals', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: description || undefined,
          imageUrl,
          sizes: sizes
            .filter((s) => s.litres && s.price)
            .map((s) => ({
              litres: Number(s.litres),
              price: Number(s.price),
              note: s.note || undefined,
            })),
        }),
      });
      setMeals((prev) => [...prev, meal]);
      setName('');
      setDescription('');
      setFile(null);
      setSizes([{ litres: '', price: '', note: '' }]);
      router.refresh();
    } catch {
      setError('Could not save meal. Please check the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAvailable(meal: Meal) {
    const updated: Meal = await apiFetch(`/vendor/meals/${meal.id}`, {
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
            <label className="text-sm font-semibold">Photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
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
          <label className="text-sm font-semibold">Sizes &amp; prices</label>
          <div className="mt-2 flex flex-col gap-2">
            {sizes.map((size, i) => {
              const litresValue = Number(size.litres);
              const hasValidLitres = size.litres !== '' && litresValue > 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Litres"
                    value={size.litres}
                    onChange={(e) => updateSize(i, 'litres', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    required
                    type="number"
                    placeholder="Price (₦)"
                    value={size.price}
                    onChange={(e) => updateSize(i, 'price', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    placeholder="Note (optional)"
                    value={size.note}
                    onChange={(e) => updateSize(i, 'note', e.target.value)}
                    className={inputClass}
                  />
                  <span className="w-24 shrink-0 whitespace-nowrap text-xs text-[#5B6B63]">
                    {hasValidLitres ? `${servingsForLitres(litresValue)} meals` : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSizes((prev) => [...prev, { litres: '', price: '', note: '' }])}
            className="mt-2 text-sm font-semibold underline"
          >
            + Add another size
          </button>
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
        {meals.map((meal) => (
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
                <h4 className="font-semibold">{meal.name}</h4>
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
              {meal.description && (
                <p className="text-sm text-[#5B6B63]">{meal.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {meal.sizes.map((size) => (
                  <span
                    key={size.id}
                    className="rounded-full bg-paper-dim px-3 py-1 font-mono text-xs"
                  >
                    {size.litres}L · {size.servings} meals · {naira(size.price)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
