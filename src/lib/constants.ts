export const SUPPORTED_CITIES = [
  { id: "delhi", name: "Delhi", state: "NCR" },
  { id: "noida", name: "Noida", state: "Uttar Pradesh" },
  { id: "gurugram", name: "Gurugram", state: "Haryana" },
  { id: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh" },
  { id: "meerut", name: "Meerut", state: "Uttar Pradesh" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra" },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana" },
  { id: "pune", name: "Pune", state: "Maharashtra" },
];

export const SEAT_CATEGORIES = {
  REGULAR: {
    name: "Regular",
    basePrice: 28000, // ₹280
    color: "#10B981",
    description: "Standard cinema plush seating with ample legroom",
  },
  PREMIUM: {
    name: "Premium",
    basePrice: 38000, // ₹380
    color: "#3B82F6",
    description: "Optimal viewing zone with high‑comfort cushioning",
  },
  EXECUTIVE: {
    name: "Executive",
    basePrice: 48000, // ₹480
    color: "#8B5CF6",
    description: "Superior center‑stage acoustic and visual positioning",
  },
  RECLINER: {
    name: "Luxury Recliner",
    basePrice: 65000, // ₹650
    color: "#D4AF37",
    description: "Fully motorized leather recliners with personal armrest tray",
  },
  VIP: {
    name: "VIP Lounge",
    basePrice: 95000, // ₹950
    color: "#EC4899",
    description: "Exclusive couple pods with gourmet in‑seat service",
  },
} as const;

export const SEAT_STATUS = {
  AVAILABLE: "available",
  SELECTED: "selected",
  HELD: "held",
  BOOKED: "booked",
  UNAVAILABLE: "unavailable",
} as const;

export const HOLD_DURATION_SECONDS = 300; // 5 minutes
export const CONVENIENCE_FEE_PAISE = 2000; // ₹20 per ticket
export const GST_RATE = 0.18; // 18% GST on (subtotal + convenience fee)
