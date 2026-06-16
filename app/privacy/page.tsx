import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy — PromptBulletin" },
  description: "How PromptBulletin collects, uses, and protects your personal data.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--muted)] mb-10">Last updated: June 2026</p>

        <section className="prose prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              When you use PromptBulletin, we may collect information you provide directly — such as your email address when you sign up for our newsletter or create an account — and information collected automatically, such as browser type, pages visited, and time spent on pages.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              We use the information we collect to operate and improve PromptBulletin, send newsletters and updates you have opted into, respond to your questions and feedback, and understand how our content is used so we can make it better.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Cookies</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              PromptBulletin uses cookies and similar technologies to remember your preferences and understand how you interact with our site. You can disable cookies in your browser settings, though some features of the site may not function correctly without them.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              We use Supabase for authentication and data storage, and Cloudflare for content delivery. These services have their own privacy policies governing how they handle data. We do not sell your personal data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Affiliate Links</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Some links on PromptBulletin are affiliate links. When you click an affiliate link and make a purchase, we may earn a commission at no additional cost to you. Affiliate relationships never influence our editorial ratings or reviews. See our <a href="/disclosures" className="text-[var(--accent)] hover:underline">Disclosures</a> page for full details.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              For privacy-related questions or requests, please visit our <a href="/contact" className="text-[var(--accent)] hover:underline">Contact</a> page.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
