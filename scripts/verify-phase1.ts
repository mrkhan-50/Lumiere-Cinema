import { prisma } from "../src/lib/prisma";
import { comparePassword, hashPassword, signToken, verifyToken } from "../src/lib/auth";
import { holdSeats, validateHold, releaseHold } from "../src/lib/reservation";
import { formatPaise } from "../src/lib/utils";

async function verifyPhase1() {
  console.log("=================================================");
  console.log("💎 LUMIÈRE — PHASE 1 AUTOMATED VERIFICATION SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${detail || "Condition not met"}`);
      process.exitCode = 1;
    }
  }

  // --- 1. Database Connection & Seed Data Integrity ---
  console.log("--- 1. Testing Database Integrity & Seeded Entities ---");
  const users = await prisma.user.findMany();
  assert(users.length >= 3, `Users seeded (${users.length} found)`, `Expected >= 3 users`);

  const admin = users.find((u) => u.role === "ADMIN");
  assert(!!admin && admin.email === "admin@lumiere.com", "Admin user verified with role ADMIN");

  const movies = await prisma.movie.findMany({ include: { showtimes: true } });
  assert(movies.length >= 5, `Movies seeded (${movies.length} found)`);

  const dune = movies.find((m) => m.title.includes("Dune"));
  assert(!!dune && dune.showtimes.length > 0, "Dune: Part Two has active showtimes mapped");

  const cinemas = await prisma.cinema.findMany({ include: { screens: { include: { seats: true } } } });
  assert(cinemas.length >= 4, `Cinemas seeded across premier cities (${cinemas.length} found)`);
  
  const totalSeats = cinemas.reduce((acc, c) => acc + c.screens.reduce((sAcc, s) => sAcc + s.seats.length, 0), 0);
  assert(totalSeats >= 280, `Luxury seats generated (${totalSeats} verified across all auditoriums)`);

  const promoCodes = await prisma.promoCode.findMany();
  assert(promoCodes.length >= 3, `Promo codes seeded (${promoCodes.length} found)`);

  // --- 2. Security & Authentication ---
  console.log("\n--- 2. Testing Cryptography, Passwords & JWT Sessions ---");
  const isMatch = await comparePassword("Admin@123", admin!.passwordHash);
  assert(isMatch, "Bcrypt successfully verified raw password against stored salted hash");

  const wrongMatch = await comparePassword("WrongPassword!", admin!.passwordHash);
  assert(!wrongMatch, "Bcrypt correctly rejected invalid password attempt");

  const testToken = signToken({
    userId: admin!.id,
    email: admin!.email,
    name: admin!.name,
    role: admin!.role,
  });
  assert(typeof testToken === "string" && testToken.length > 20, "JWT token successfully signed");

  const decoded = verifyToken(testToken);
  assert(decoded?.email === admin!.email && decoded?.role === "ADMIN", "JWT token verified and payload extracted");

  // --- 3. Concurrency-Safe Seat Hold Engine ---
  console.log("\n--- 3. Testing Concurrency-Safe Seat Hold & Hold Lifecycle ---");
  const firstShowtime = await prisma.showtime.findFirst({
    include: { screen: { include: { seats: true } } },
  });
  assert(!!firstShowtime, "Retrieved sample showtime for reservation testing");

  const testSeats = firstShowtime!.screen.seats.slice(0, 2).map((s) => s.id);
  assert(testSeats.length === 2, `Selected 2 test seats: ${testSeats.join(", ")}`);

  // Attempt 1: Acquire Hold
  const holdResult1 = await holdSeats({
    showtimeId: firstShowtime!.id,
    seatIds: testSeats,
    userId: admin!.id,
  });
  assert(holdResult1.success && !!holdResult1.holdToken, "Patron 1 successfully acquired 5-minute hold on seats");

  // Attempt 2: Simultaneous Conflicting Hold by Another Patron
  const patronUser = users.find((u) => u.role === "USER");
  const holdResult2 = await holdSeats({
    showtimeId: firstShowtime!.id,
    seatIds: [testSeats[0]], // same seat
    userId: patronUser?.id,
  });
  assert(
    !holdResult2.success,
    "Concurrency Guard: Conflicting reservation request on held seat was safely rejected!"
  );

  // Validate Hold Status
  const validation = await validateHold(holdResult1.holdToken!, firstShowtime!.id);
  assert(validation.valid && validation.hold?.status === "ACTIVE", "Hold token validated as ACTIVE in database");

  // Release Hold
  const releaseResult = await releaseHold(holdResult1.holdToken!);
  assert(releaseResult.success, "Hold successfully released back to inventory");

  // Attempt 3: Re-acquiring after release
  const holdResult3 = await holdSeats({
    showtimeId: firstShowtime!.id,
    seatIds: testSeats,
    userId: patronUser?.id,
  });
  assert(holdResult3.success, "Seat re-acquired successfully after prior hold release");

  // Clean up test hold
  if (holdResult3.holdToken) {
    await releaseHold(holdResult3.holdToken);
  }

  // --- 4. Currency Precision Check ---
  console.log("\n--- 4. Testing Currency Precision & Minor Unit Conversions ---");
  assert(formatPaise(28000) === "₹280", "28000 paise formats cleanly as ₹280");
  assert(formatPaise(65000) === "₹650", "65000 paise formats cleanly as ₹650");
  assert(formatPaise(3540) === "₹35.40" || formatPaise(3540).includes("35.4"), "Minor paise values preserved without float drift");

  console.log("\n=================================================");
  console.log(`🎯 VERIFICATION COMPLETE: ${passed}/${total} TESTS PASSED`);
  console.log("=================================================\n");
}

verifyPhase1()
  .catch((err) => {
    console.error("Verification crashed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
