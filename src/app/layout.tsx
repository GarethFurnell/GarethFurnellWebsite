import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Gareth Furnell | Creative Developer",
  description: "Portfolio of Gareth Furnell, a Creative Developer specializing in Generative AI, 3D Vector Graphs, Cloud Architecture, and Web Experiences.",
  keywords: ["Gareth Furnell", "Creative Developer", "Software Engineer", "MongoDB", "AI", "Vector Search", "Photography", "Ableton"],
  openGraph: {
    title: "Gareth Furnell | Creative Developer",
    description: "Crafting innovative digital experiences through code, creativity, and emergence.",
    url: baseUrl,
    siteName: "Gareth Furnell Portfolio",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Gareth Furnell - Creative Developer & Technologist",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gareth Furnell | Creative Developer",
    description: "Crafting innovative digital experiences through code, creativity, and emergence.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

import NetworkBackground from "@/components/NetworkBackground";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`} style={{ colorScheme: 'dark' }}>
      <body className="bg-black text-white font-sans selection:bg-zinc-800 flex flex-col min-h-screen">
        <CartProvider>
          <NetworkBackground />
          <Header />
          <div className="flex-1 flex flex-col w-full pt-16 md:pt-24">
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
