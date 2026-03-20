import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-frank",
});

export const metadata: Metadata = {
  title: "Legal AI – Your Intelligent Legal Assistant",
  description: "AI-powered legal document analysis and Q&A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${frankRuhlLibre.variable}`}>
      <body className="antialiased font-[var(--font-inter)]">{children}</body>
    </html>
  );
}
