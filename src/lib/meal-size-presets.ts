/**
 * Mirrors backend/src/vendors/meal-size-presets.ts — a "serving" means one meal for one adult
 * (~0.8L per meal), so the vendor just types a litre value and we've done the math.
 */
const LITRES_PER_SERVING = 0.8;

export function servingsForLitres(litres: number): number {
  return Math.max(1, Math.round(litres / LITRES_PER_SERVING));
}
