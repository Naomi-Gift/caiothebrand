/**
 * The customer pays Paystack's fee: it's added on top of the order total so
 * the brand still receives the full food total after Paystack's cut.
 *
 * Paystack Nigeria (local cards/transfers): 1.5% + ₦100, the ₦100 waived
 * under ₦2,500, the whole fee capped at ₦2,000. Shared by the checkout page
 * (to show it) and the server (to charge and verify it).
 */
const RATE = 0.015;
const FLAT = 100;
const FLAT_WAIVED_BELOW = 2500;
const CAP = 2000;

/** Fee in whole naira for an order total in naira, rounded up so the brand never comes up short. */
export function paystackFee(total: number): number {
  if (total <= 0) return 0;
  let charge = total / (1 - RATE);
  if (charge >= FLAT_WAIVED_BELOW) charge = (total + FLAT) / (1 - RATE);
  return Math.min(CAP, Math.ceil(charge - total));
}
