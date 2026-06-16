import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata: Metadata = {
  title: { absolute: "Editorial Standards — PromptBulletin" },
  description: "How PromptBulletin reviews and rates AI tools. Our 12-point methodology, independence policy, and editorial guidelines.",
  alternates: { canonical: `${SITE_URL}/editorial-standards` },
};

const criteria = [
  { n: "01", title: "Performance",        desc: "Does the tool deliver on its core promise? We test with real tasks, not demos." },
  { n: "02", title: "Value for Money",    desc: "Is the pricing fair relative to what competitors offer at the same tier?" },
  { n: "03", title: "Ease of Use",        desc: "How quickly can a new user get meaningful output? We time first-run onboarding." },
  { n: "04", title: "Output Quality",     desc: "For generative tools, we evaluate accuracy, coherence, and practical usefulness of outputs." },
  { n: "05", title: "Feature Depth",      desc: "Does the tool have the controls and customization power that advanced users need?" },
  { n: "06", title: "Documentation",      desc: "Is the help center, API docs, and support material complete and easy to navigate?" },
  { n: "07", title: "Reliability",        desc: "Uptime, latency, and stability under normal load over a multi-week testing period." },
  { n: "08", title: "Integrations",       desc: "How well does it connect with the rest of a modern workflow — APIs, webhooks, popular apps?" },
  { n: "09", title: "Privacy & Security", desc: "Data retention policies, SOC2/GDPR compliance status, and how user data is used for training." },
  { n: "10", title: "Support Quality",    desc: "Responsiveness and helpfulness of customer support across free and paid tiers." },
  { n: "11", title: "Update Cadence",     desc: "Is the team actively shipping? Dead tools score lower regardless of current feature set." },
  { n: "12", title: "Community & Reputation", desc: "User sentiment from independent sources — Reddit, G2, Trustpilot — cross-referenced against our own testing." },
];

export default function EditorialStandardsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Editorial Standards</h1>
        <p className="text-sm text-[var(--muted)] mb-6">How we review and rate AI tools — and what we will never do.</p>

        <section className="space-y-10">
          <div>
            <h2 className="text-xl font-semibold mb-3">Independence First</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              PromptBulletin editorial scores and rankings are never influenced by advertising, affiliate commissions, or tool vendor relationships. Sponsored placements are clearly labeled with a &quot;Sponsored&quot; badge and do not appear in organic ranked results. We decline vendor requests to review unpublished tools under NDA arrangements that could compromise our ability to disclose limitations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Our 12-Point Scoring Rubric</h2>
            <p className="text-[var(--muted)] leading-relaxed mb-6">
              Every tool reviewed on PromptBulletin is evaluated across twelve criteria, each scored on a 1–10 scale. The final Editor Score is a weighted average that emphasises performance and value, the two factors our readers care most about.
            </p>
            <div className="grid gap-4">
              {criteria.map((c) => (
                <div key={c.n} className="flex gap-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                  <span className="text-xs font-mono text-[var(--accent)] pt-0.5 w-6 shrink-0">{c.n}</span>
                  <div>
                    <p className="font-medium text-sm mb-0.5">{c.title}</p>
                    <p className="text-xs text-[var(--muted)]">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Testing Process</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Editors test each tool hands-on using a standardised test suite before publishing a review. For AI generative tools, we run a fixed set of prompts and compare outputs across multiple sessions. Testing typically takes 1–3 weeks. We re-review tools annually or when significant pricing or feature changes occur.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Corrections Policy</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              We correct factual errors promptly. If you spot an error in a review — incorrect pricing, outdated features, or a factual mistake — please <a href="/contact" className="text-[var(--accent)] hover:underline">contact us</a>. We note significant corrections at the bottom of the article with the date of the update.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Affiliate Relationships</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Some tool links on PromptBulletin are affiliate links. If you click through and purchase, we may earn a commission. This never affects our ratings. See our full <a href="/disclosures" className="text-[var(--accent)] hover:underline">Disclosures</a> page for details.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
