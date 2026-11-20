import type { Metadata } from "next";
import { Poppins, Press_Start_2P } from "next/font/google";
import "./globals.css";
import "./dashboard.css";
import { AppStateProvider } from "@/state/AppState";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const pixelFont = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Froosh Junction | Fresh Juices & Shakes in Entally, Kolkata",
  description: "Your next fresh stop in Entally, Kolkata. Explore fresh juices and creamy shakes, choose your size, and order from Froosh Junction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${pixelFont.variable}`}>
      <body className="bg-[#F8FAFC] text-slate-900 min-h-screen selection:bg-amber-300 selection:text-slate-900 antialiased font-sans">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}

