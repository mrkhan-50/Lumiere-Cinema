import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer minor currency units (paise) to display currency string.
 * Example: 35000 -> "₹350"
 */
export function formatPaise(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amountInPaise % 100 === 0 ? 0 : 2,
  }).format(rupees);
}

/**
 * Format date in cinematic format
 */
export function formatDate(dateInput: string | Date): string {
  const d = new Date(dateInput);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format showtime (e.g. 10:30 AM)
 */
export function formatTime(dateInput: string | Date): string {
  const d = new Date(dateInput);
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Generate a cryptographically random booking reference
 */
export function generateBookingReference(): string {
  const prefix = "LUM";
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${year}-${randomChars}`;
}
