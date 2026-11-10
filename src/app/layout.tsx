import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { AuthModal } from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "LUMIÈRE — Experience Cinema Beyond the Screen",
  description:
    "Luxury dark cinematic 3D movie ticket booking platform. Discover blockbuster cinema, reserve interactive seats with 5-minute holds, and receive verified QR tickets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-lumiere-text antialiased min-h-screen flex flex-col selection:bg-gold-500 selection:text-neutral-950">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
