import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const links = [
  { label: "Browse AI Tools",        href: "/#discover",           desc: "Discover 1,200+ reviewed tools" },
  { label: "Blog & Guides",          href: "/blog",                desc: "In-depth articles and comparisons" },
  { label: "Editorial Standards",    href: "/editorial-standards", desc: "How we review and rate tools" },
  { label: "Submit a Tool",          href: "/#submit",             desc: "Get your tool listed" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 text-center">
        {/* Big 404 */}
        <div
          className="text-[160px] font-black leading-none select-none"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #ffffff18 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>

        <h1 className="text-2xl font-bold mt-4 mb-2">Page not found</h1>
        <p className="text-[var(--muted)] max-w-md mb-12">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Here are some helpful places to go instead:
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-12">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col items-start p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-colors text-left"
            >
              <span className="font-semibold text-sm mb-0.5">{l.label}</span>
              <span className="text-xs text-[var(--muted)]">{l.desc}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
          style={{ backgroundColor: "var(--accent)", color: "#000" }}
        >
          ← Back to Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
