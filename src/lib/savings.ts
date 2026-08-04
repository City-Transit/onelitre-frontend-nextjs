import type { SavingsBenchmark } from './types';

export interface SavingsResult {
  mealsCovered: number;
  /** What those meals would have cost via typical food-delivery apps — meal price plus a
   * delivery fee for every order, since delivery-app customers order a few meals at a time
   * rather than in one bulk batch. */
  restaurantEquivalentCost: number;
  onelitreCost: number;
  savings: number;
  /** Fraction of restaurantEquivalentCost saved, e.g. 0.62 for "62% back". 0 when there's
   * nothing to compare (no meals). */
  pctSaved: number;
}

/**
 * See SavingsBenchmark entity (backend) for the reasoning behind the formula:
 * restaurantEquivalentCost = mealsCovered * avgPricePerMeal + numberOfOrders * avgDeliveryFeePerOrder
 * numberOfOrders = ceil(mealsCovered / avgMealsPerDeliveryOrder)
 */
export function computeSavings(
  mealsCovered: number,
  onelitreCost: number,
  benchmark: Pick<
    SavingsBenchmark,
    'avgPricePerMeal' | 'avgMealsPerDeliveryOrder' | 'avgDeliveryFeePerOrder'
  >,
): SavingsResult {
  if (mealsCovered <= 0) {
    return { mealsCovered: 0, restaurantEquivalentCost: 0, onelitreCost, savings: 0, pctSaved: 0 };
  }
  const numberOfOrders = Math.ceil(mealsCovered / benchmark.avgMealsPerDeliveryOrder);
  const restaurantEquivalentCost =
    mealsCovered * benchmark.avgPricePerMeal + numberOfOrders * benchmark.avgDeliveryFeePerOrder;
  const savings = restaurantEquivalentCost - onelitreCost;
  const pctSaved = restaurantEquivalentCost > 0 ? savings / restaurantEquivalentCost : 0;
  return { mealsCovered, restaurantEquivalentCost, onelitreCost, savings, pctSaved };
}
