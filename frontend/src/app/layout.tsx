import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EstateIQ AI - Real Estate Investment Advisor",
  description: "AI-Powered Real Estate Investment Decision Support Platform for Luxury Properties in Dubai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        {/* Leaflet CSS has been imported directly in globals.css, no need for separate link tag */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
