import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service — PromptBulletin" },
  description: "The terms governing your use of PromptBulletin, the AI tools directory.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--muted)] mb-10">Last updated: June 2026</p>

        <section className="prose prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              By accessing or using PromptBulletin, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the site.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Use of Content</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              All content on PromptBulletin — including reviews, ratings, articles, and editorial assessments — is for informational purposes only. You may share and link to our content with attribution. Reproduction of substantial portions without permission is prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Editorial Independence</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              PromptBulletin&apos;s editorial opinions are independent. Tool ratings and rankings reflect our editors&apos; honest assessments. We do not guarantee the accuracy, completeness, or currency of any third-party tool information and accept no liability for decisions made based on our reviews.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">User Accounts</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              You are responsible for maintaining the security of your account. Do not share your credentials. We reserve the right to suspend accounts that violate these terms or engage in abuse.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Tool Submissions</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              Submitted tools are reviewed at our editorial discretion. Submission does not guarantee listing. We may edit, reject, or remove any submission at any time. Submitting a tool does not create a commercial relationship or influence editorial ratings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              PromptBulletin is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the site or reliance on its content.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
            <p className="text-[var(--muted)] leading-relaxed">
              We may update these terms from time to time. Continued use of the site after changes constitutes acceptance of the revised terms.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
