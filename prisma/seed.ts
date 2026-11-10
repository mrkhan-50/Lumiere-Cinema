import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🎬 Initiating LUMIÈRE Database Seed...");

  // 1. Clean existing records safely
  await prisma.auditLog.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.bookingSeat.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.seatHoldItem.deleteMany({});
  await prisma.seatHold.deleteMany({});
  await prisma.seat.deleteMany({});
  await prisma.showtime.deleteMany({});
  await prisma.screen.deleteMany({});
  await prisma.cinema.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.promoCode.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const staffPassword = await bcrypt.hash("Staff@123", 10);
  const patronPassword = await bcrypt.hash("Patron@123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Lumière Executive Admin",
      email: "admin@lumiere.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "+91 98765 43210",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Cinema Usher Staff",
      email: "staff@lumiere.com",
      passwordHash: staffPassword,
      role: "CINEMA_STAFF",
      phone: "+91 98765 43211",
    },
  });

  const patron = await prisma.user.create({
    data: {
      name: "Alex Vane",
      email: "alex@example.com",
      passwordHash: patronPassword,
      role: "USER",
      phone: "+91 98765 43212",
    },
  });

  console.log("✅ Seeded Users: Admin (admin@lumiere.com), Staff, Patron");

  // 3. Create Promo Codes
  await prisma.promoCode.createMany({
    data: [
      {
        code: "LUMIERE50",
        description: "50% off up to ₹200 for premier guests",
        discountType: "PERCENTAGE",
        discountValue: 50,
        minOrderValue: 40000,
        maxDiscount: 20000,
        usageLimit: 500,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        code: "GOLDEN20",
        description: "20% privilege discount on luxury recliner shows",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderValue: 50000,
        maxDiscount: 30000,
        usageLimit: 1000,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        code: "WELCOME100",
        description: "Flat ₹100 inaugural celebration reward",
        discountType: "FIXED",
        discountValue: 10000, // ₹100
        minOrderValue: 50000,
        usageLimit: 2000,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      // Specification promo codes
      {
        code: "LUMIERE20",
        description: "20% off up to ₹100 — exclusive LUMIÈRE discount",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderValue: 0,
        maxDiscount: 10000, // ₹100
        usageLimit: 1000,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
      {
        code: "WELCOME50",
        description: "Flat ₹50 off — minimum ₹300 order",
        discountType: "FIXED",
        discountValue: 5000, // ₹50
        minOrderValue: 30000, // ₹300
        usageLimit: 2000,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
      {
        code: "CINEMA10",
        description: "10% off up to ₹75 — cinephile reward",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 0,
        maxDiscount: 7500, // ₹75
        usageLimit: 1500,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Seeded Promo Codes (LUMIERE50, GOLDEN20, WELCOME100)");

  // 4. Create Movies
  const movieDune = await prisma.movie.create({
    data: {
      title: "Dune: Part Two",
      description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
      genre: "Sci-Fi, Action, Adventure",
      language: "English",
      duration: 166,
      releaseDate: new Date("2024-03-01"),
      posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
      certification: "U/A 16+",
      rating: 8.8,
      status: "NOW_SHOWING",
      cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler",
      director: "Denis Villeneuve",
      formats: "2D, 3D, IMAX 70mm, Dolby Atmos",
    },
  });

  const movieOppenheimer = await prisma.movie.create({
    data: {
      title: "Oppenheimer",
      description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral weight of ultimate power.",
      genre: "Biography, Drama, History",
      language: "English",
      duration: 180,
      releaseDate: new Date("2023-07-21"),
      posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
      certification: "A",
      rating: 8.9,
      status: "NOW_SHOWING",
      cast: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh",
      director: "Christopher Nolan",
      formats: "IMAX 70mm, 2D, Dolby Atmos",
    },
  });

  const movieInterstellar = await prisma.movie.create({
    data: {
      title: "Interstellar: 10th Anniversary",
      description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
      genre: "Sci-Fi, Drama, Adventure",
      language: "English",
      duration: 169,
      releaseDate: new Date("2024-09-27"),
      posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      certification: "U/A",
      rating: 8.7,
      status: "TRENDING",
      cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine",
      director: "Christopher Nolan",
      formats: "IMAX Laser, 2D",
    },
  });

  const movieKalki = await prisma.movie.create({
    data: {
      title: "Kalki 2898 AD",
      description: "A modern avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces in a dystopian future.",
      genre: "Action, Sci-Fi, Mythological",
      language: "Hindi",
      duration: 181,
      releaseDate: new Date("2024-06-27"),
      posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=kQDd1AhGIHk",
      certification: "U/A 13+",
      rating: 8.2,
      status: "NOW_SHOWING",
      cast: "Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone",
      director: "Nag Ashwin",
      formats: "3D, IMAX, 2D",
    },
  });

  const movieGladiator = await prisma.movie.create({
    data: {
      title: "Gladiator II",
      description: "After his home is conquered by the tyrannical emperors who now lead Rome, Lucius must enter the Colosseum and look to his past to find strength and honor to return the glory of Rome to its people.",
      genre: "Action, Drama, History",
      language: "English",
      duration: 148,
      releaseDate: new Date("2024-11-15"),
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
      certification: "A",
      rating: 8.4,
      status: "COMING_SOON",
      cast: "Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen",
      director: "Ridley Scott",
      formats: "IMAX, Dolby Atmos, 2D",
    },
  });

  console.log("✅ Seeded Movies (Dune 2, Oppenheimer, Interstellar, Kalki, Gladiator II)");

  // 5. Create Cinemas
  const cinemaDelhi = await prisma.cinema.create({
    data: {
      name: "LUMIÈRE Grand Rex — Connaught Place",
      city: "Delhi",
      address: "Inner Circle, Block A, Connaught Place, New Delhi, Delhi 110001",
      facilities: "Grand IMAX Laser, Dolby Atmos 64-Channel, Valet Parking, Private Dining Lounge, Gourmet In-Seat Butler",
      status: "ACTIVE",
    },
  });

  const cinemaNoida = await prisma.cinema.create({
    data: {
      name: "LUMIÈRE Pinnacle — DLF Mall of India",
      city: "Noida",
      address: "Sector 18, DLF Mall of India, Level 5, Noida, Uttar Pradesh 201301",
      facilities: "Dual 4K Laser IMAX, 4DX Motion Theatre, VIP Luxury Recliners, Champagne Bar",
      status: "ACTIVE",
    },
  });

  const cinemaMumbai = await prisma.cinema.create({
    data: {
      name: "LUMIÈRE Royale — Bandra West",
      city: "Mumbai",
      address: "Hill Road, Bandra West, Mumbai, Maharashtra 400050",
      facilities: "Sovereign 70mm Screen, Onyx LED Display, Velvet Loungers, Sommelier Service",
      status: "ACTIVE",
    },
  });

  const cinemaBengaluru = await prisma.cinema.create({
    data: {
      name: "LUMIÈRE Celestial — Koramangala",
      city: "Bengaluru",
      address: "80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
      facilities: "Quantum IMAX Laser, Dolby Atmos, Recliner Pods, Organic Cafe",
      status: "ACTIVE",
    },
  });

  console.log("✅ Seeded Cinemas in Delhi, Noida, Mumbai, Bengaluru");

  // 6. Create Screens & Realistic Seat Layouts
  const screens = [
    { cinema: cinemaDelhi, name: "Audi 1 — The Sovereign IMAX", format: "IMAX Laser" },
    { cinema: cinemaDelhi, name: "Audi 2 — Royal Atmos Hall", format: "Dolby Atmos" },
    { cinema: cinemaNoida, name: "Audi 1 — IMAX Grand Auditorium", format: "IMAX 3D" },
    { cinema: cinemaMumbai, name: "Audi 1 — 70mm Heritage Screen", format: "IMAX 70mm" },
  ];

  for (const s of screens) {
    const screen = await prisma.screen.create({
      data: {
        cinemaId: s.cinema.id,
        name: s.name,
        format: s.format,
        totalSeats: 70, // 7 rows x 10 seats
        seatingLayout: JSON.stringify({
          rows: ["A", "B", "C", "D", "E", "F", "G"],
          columns: 10,
          aisleAfter: [3, 7],
        }),
      },
    });

    // Generate Seats:
    // Rows A, B: Regular (₹280)
    // Rows C, D: Premium (₹380)
    // Rows E, F: Executive (₹480)
    // Row G: Luxury Recliner (₹650)
    const seatData = [];
    const rows = [
      { row: "A", category: "REGULAR", price: 28000 },
      { row: "B", category: "REGULAR", price: 28000 },
      { row: "C", category: "PREMIUM", price: 38000 },
      { row: "D", category: "PREMIUM", price: 38000 },
      { row: "E", category: "EXECUTIVE", price: 48000 },
      { row: "F", category: "EXECUTIVE", price: 48000 },
      { row: "G", category: "RECLINER", price: 65000 },
    ];

    for (const r of rows) {
      for (let num = 1; num <= 10; num++) {
        seatData.push({
          screenId: screen.id,
          row: r.row,
          number: num,
          category: r.category,
          basePrice: r.price,
        });
      }
    }

    await prisma.seat.createMany({ data: seatData });

    // 7. Create Showtimes for each screen (Morning, Afternoon, Evening, Night)
    const movies = [movieDune, movieOppenheimer, movieInterstellar, movieKalki];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const showDate = new Date(today);
      showDate.setDate(today.getDate() + dayOffset);

      const slots = [
        { hour: 10, min: 30, movie: movies[0] },
        { hour: 14, min: 15, movie: movies[1] },
        { hour: 18, min: 0, movie: movies[2] },
        { hour: 21, min: 45, movie: movies[3] },
      ];

      for (const slot of slots) {
        const startsAt = new Date(showDate);
        startsAt.setHours(slot.hour, slot.min, 0, 0);
        const endsAt = new Date(startsAt.getTime() + slot.movie.duration * 60 * 1000);

        await prisma.showtime.create({
          data: {
            movieId: slot.movie.id,
            screenId: screen.id,
            startsAt,
            endsAt,
            format: s.format,
            priceMultiplier: slot.hour >= 18 ? 1.15 : 1.0, // evening prime surge
            status: "SCHEDULED",
          },
        });
      }
    }
  }

  console.log("✅ Seeded Screens, 280+ Seats, and 80+ Multi-Day Showtimes");
  console.log("🌟 LUMIÈRE Database Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
