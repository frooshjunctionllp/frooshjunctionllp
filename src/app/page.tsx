import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import { CustomerView } from "@/components/customer/CustomerView";
import "@/components/customer/storefront.css";

const stationFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-station",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Froosh Junction | Kolkata’s Juice & Shake Stop",
  description: "Explore the Froosh Junction menu, customize your drink, and order juices and shakes from our Entally, Kolkata counter.",
};

export default function Home() {
  return <CustomerView fontClassName={stationFont.variable} />;
}
