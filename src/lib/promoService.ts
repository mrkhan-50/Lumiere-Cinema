import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

/**
 * Validate a promo code for a given showtime and hold.
 * Returns the discount amount in paise and additional info.
 */
export async function validatePromoCode({
  code,
  showtimeId,
  holdToken,
}: {
  code: string;
  showtimeId: string;
  holdToken: string;
}) {
  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (!promo) {
    return { valid: false, message: 'Promo code does not exist' };
  }
  if (!promo.isActive) {
    return { valid: false, message: 'Promo code is inactive' };
  }
  if (promo.expiresAt < new Date()) {
    return { valid: false, message: 'Promo code has expired' };
  }
  if (promo.timesUsed >= promo.usageLimit) {
    return { valid: false, message: 'Promo code usage limit reached' };
  }

  // Ensure the hold belongs to the same showtime
  const hold = await prisma.seatHold.findUnique({
    where: { holdToken },
    select: { showtimeId: true },
  });
  if (!hold || hold.showtimeId !== showtimeId) {
    return { valid: false, message: 'Hold token does not match showtime' };
  }

  // Compute subtotal for seats in the hold to apply minOrderValue check
  const holdItems = await prisma.seatHoldItem.findMany({
    where: { hold: { holdToken } },
    include: { seat: true },
  });
  const subtotal = holdItems.reduce((sum, item) => sum + (item.seat.basePrice ?? 0), 0);

  if (subtotal < promo.minOrderValue) {
    return { valid: false, message: `Minimum order value not met (₹${(promo.minOrderValue / 100).toFixed(2)})` };
  }

  let discountAmount = 0;
  if (promo.discountType === 'PERCENTAGE') {
    discountAmount = Math.floor((subtotal * promo.discountValue) / 100);
    if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount;
    }
  } else if (promo.discountType === 'FIXED') {
    discountAmount = promo.discountValue;
  }

  // Ensure discount does not exceed subtotal
  if (discountAmount > subtotal) discountAmount = subtotal;

  return {
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
    currency: 'INR',
    message: `${promo.discountValue}${promo.discountType === 'PERCENTAGE' ? '%' : ''} discount applied`,
    promoId: promo.id,
  };
}
