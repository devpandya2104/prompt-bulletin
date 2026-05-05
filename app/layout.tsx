import type { Metadata } from "next";
import { Space_Grotesk, Inter, Lora } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com"),
  title: "PromptBulletin — AI Tools & Website Reviews",
  description:
    "Discover the best AI tools through editorial reviews, community upvotes, and structured comparisons. Trusted by 48K+ professionals.",
  keywords: ["AI tools", "AI reviews", "best AI tools 2026", "AI directory", "prompt tools"],
  openGraph: {
    title: "PromptBulletin — AI Tools & Website Reviews",
    description: "Editorial reviews, real upvotes, and structured comparisons for every AI tool.",
    type: "website",
    url: "https://promptbulletin.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${lora.variable}`}>
      <body className="min-h-screen" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
