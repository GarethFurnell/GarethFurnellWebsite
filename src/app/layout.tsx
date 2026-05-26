import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Gareth Furnell | Portfolio",
  description: "Portfolio and projects of Gareth Furnell.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`} style={{ colorScheme: 'dark' }}>
      <body className="bg-black min-h-screen text-white font-sans selection:bg-zinc-800">
        {children}
      </body>
    </html>
  );
}
