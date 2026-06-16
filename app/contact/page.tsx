import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata: Metadata = {
  title: { absolute: "Contact — PromptBulletin" },
  description: "Get in touch with the PromptBulletin editorial team for corrections, tool submissions, partnerships, or press inquiries.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

const topics = [
  { title: "Tool Submission",      desc: "Want your tool reviewed? Submit it via the form on our homepage.", href: "/#submit" },
  { title: "Corrections",          desc: "Spotted an error in a review? Let us know and we'll fix it fast.", href: "mailto:corrections@promptbulletin.com" },
  { title: "Press & Partnerships", desc: "Media, sponsorship, or co-marketing enquiries.", href: "mailto:partnerships@promptbulletin.com" },
  { title: "Editorial Team",       desc: "For editorial feedback or story tips.", href: "mailto:editorial@promptbulletin.com" },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Contact</h1>
        <p className="text-[var(--muted)] mb-10">
          We&apos;re a small editorial team — we read every message and aim to reply within 2 business days.
        </p>

        <div className="grid gap-4">
          {topics.map((t) => (
            <a
              key={t.title}
              href={t.href}
              className="block p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-colors"
            >
              <p className="font-semibold mb-1">{t.title}</p>
              <p className="text-sm text-[var(--muted)]">{t.desc}</p>
            </a>
          ))}
        </div>

        <p className="text-xs text-[var(--muted)] mt-10">
          For privacy-related requests including data deletion, email{" "}
          <a href="mailto:privacy@promptbulletin.com" className="text-[var(--accent)] hover:underline">
            privacy@promptbulletin.com
          </a>.
        </p>
      </main>
      <Footer />
    </>
  );
}
