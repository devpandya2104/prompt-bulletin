import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata: Metadata = {
  title: { absolute: "Disclosures — PromptBulletin" },
  description: "PromptBulletin's affiliate, sponsorship, and editorial relationship disclosures.",
  alternates: { canonical: `${SITE_URL}/disclosures` },
};

export default function DisclosuresPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Disclosures</h1>
        <p className="text-sm text-[var(--muted)] mb-10">Last updated: June 2026</p>

        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">Affiliate Links</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              PromptBulletin participates in affiliate programs. Some links to tools and products on this site include affiliate tracking codes. When you click an affiliate link and complete a purchase or sign-up, we may earn a commission from the tool vendor. This commission comes at no additional cost to you.
            </p>
            <p className="text-[var(--muted)] leading-relaxed mt-4">
              Affiliate income helps fund our editorial team and keeps PromptBulletin free to use. However, affiliate relationships have zero influence on our editorial ratings, rankings, or review content. Tools that pay us commissions receive the same objective scoring as tools that do not. We regularly recommend free tools and tools with no affiliate relationship when they are the best option.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Sponsored Content</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Occasionally, tool vendors pay to have their products featured in sponsored placements. All sponsored content and sponsored listings are clearly labeled with a &quot;Sponsored&quot; badge or similar disclosure. Sponsored placements never appear in organic editorial rankings or Best-Of lists.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Free Access & Review Copies</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Tool vendors sometimes provide free or extended access to their products to facilitate our reviews. Receiving free access does not guarantee a positive review, a listing, or any particular score. Our editors are required to disclose when a review was conducted using a vendor-provided account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">No Pay-to-Play Rankings</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              PromptBulletin editorial scores and organic rankings cannot be purchased. Vendors cannot pay to increase their rating, appear in roundup articles, or be excluded from negative coverage. Our <a href="/editorial-standards" className="text-[var(--accent)] hover:underline">Editorial Standards</a> page describes our full review methodology.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">FTC Compliance</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              In accordance with FTC guidelines (16 CFR Part 255), we disclose material connections between PromptBulletin and tool vendors whenever those connections could affect how readers weigh our recommendations. If you have questions about any specific disclosure, please <a href="/contact" className="text-[var(--accent)] hover:underline">contact us</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
