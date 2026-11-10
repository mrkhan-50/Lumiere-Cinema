import { prisma } from './prisma';
import { PromoCode } from '@prisma/client';
import { CONVENIENCE_FEE_PAISE, GST_RATE } from './constants';

/**
 * Compute the pricing breakdown for a set of seats.
 * Returns: subtotal, convenienceFee, taxAmount, discountAmount, totalAmount.
 * All values are in paise.
 */
export async function calculatePricing({
  seatIds,
  promoId,
}: {
  seatIds: string[];
  promoId?: string;
}) {
  // Load seats with base price and category
  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds } },
    select: { id: true, basePrice: true, category: true },
  });

  const subtotal = seats.reduce((sum, s) => sum + (s.basePrice ?? 0), 0);
  const convenienceFee = CONVENIENCE_FEE_PAISE * seats.length;

  // Tax calculation – 18% GST on (subtotal + convenienceFee)
  const taxBase = subtotal + convenienceFee;
  const taxAmount = Math.round(taxBase * GST_RATE);

  let discountAmount = 0;
  let promo: PromoCode | null = null;
  if (promoId) {
    promo = await prisma.promoCode.findUnique({ where: { id: promoId } });
    if (promo && promo.isActive && promo.expiresAt > new Date()) {
      if (promo.discountType === 'PERCENTAGE') {
        discountAmount = Math.floor((subtotal * promo.discountValue) / 100);
        if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
          discountAmount = promo.maxDiscount;
        }
      } else if (promo.discountType === 'FIXED') {
        discountAmount = promo.discountValue;
      }
      // Respect minOrderValue
      if (subtotal < promo.minOrderValue) {
        discountAmount = 0;
      }
    }
  }

  // Ensure discount never exceeds subtotal
  if (discountAmount > subtotal) discountAmount = subtotal;

  const totalAmount = subtotal + convenienceFee + taxAmount - discountAmount;

  return {
    subtotal,
    convenienceFee,
    taxAmount,
    discountAmount,
    totalAmount,
    seatDetails: seats.map((s) => ({ id: s.id, price: s.basePrice, category: s.category })),
    promoApplied: promo ? { code: promo.code, id: promo.id } : null,
  };
}
