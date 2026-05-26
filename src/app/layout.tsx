import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const handscript = localFont({
  src: [
    {
      path: "../../public/fonts/Handscriptregular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/HandscriptItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/HandscriptBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-handscript",
});

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
    <html lang="en" className={`${inter.variable} ${handscript.variable} antialiased dark`} style={{ colorScheme: 'dark' }}>
      <body className="bg-black min-h-screen text-white font-sans selection:bg-zinc-800">
        {children}
      </body>
    </html>
  );
}
