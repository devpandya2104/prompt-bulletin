import type { Metadata } from "next";
import { Space_Grotesk, Inter, Lora } from "next/font/google";
import "./globals.css";
import EmailConfirmBanner from "@/components/EmailConfirmBanner";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PromptBulletin — AI Tools & Website Reviews",
    template: "%s | PromptBulletin",
  },
  description:
    "Discover the best AI tools through editorial reviews, community upvotes, and structured comparisons. Trusted by 48K+ professionals.",
  keywords: ["AI tools", "AI reviews", "best AI tools 2026", "AI directory", "prompt tools"],
  openGraph: {
    title: "PromptBulletin — AI Tools & Website Reviews",
    description: "Editorial reviews, real upvotes, and structured comparisons for every AI tool.",
    type: "website",
    url: SITE_URL,
    siteName: "PromptBulletin",
    locale: "en_US",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "PromptBulletin — AI Tools Directory" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@promptbulletin",
    creator: "@promptbulletin",
  },
  alternates: { canonical: SITE_URL },
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
        <EmailConfirmBanner />
      </body>
    </html>
  );
}
