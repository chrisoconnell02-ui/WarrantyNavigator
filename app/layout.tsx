import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dealer Warranty Planner",
  description: "A dealership warranty planner that maps factory coverage against ownership and loan life cycle."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
