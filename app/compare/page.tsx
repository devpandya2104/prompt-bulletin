import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata: Metadata = {
  title: "AI Tool Comparisons — PromptBulletin",
  description: "In-depth head-to-head comparisons of popular AI tools. Find out which tool wins for your use case.",
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: "AI Tool Comparisons — PromptBulletin",
    description: "In-depth head-to-head comparisons of popular AI tools.",
    type: "website",
    url: `${SITE_URL}/compare`,
    siteName: "PromptBulletin",
    locale: "en_US",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "PromptBulletin Comparisons" }],
  },
};

type ComparisonPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_name: string;
  author_initials: string;
  cover_image_url: string | null;
  published_at: string | null;
  read_time: string;
  upvote_count: number;
};

export default async function ComparePage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, author_name, author_initials, cover_image_url, published_at, read_time, upvote_count")
    .eq("is_published", true)
    .eq("post_type", "comparison")
    .order("published_at", { ascending: false });

  const comparisons = (posts ?? []) as ComparisonPost[];

  return (
    <>
      <Navbar />
      <main style={{ fontFamily: "var(--font-inter)", color: "var(--text)", minHeight: "80vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 80px" }}>
          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <nav style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16, display: "flex", gap: 6, alignItems: "center" }}>
              <a href="/" style={{ color: "var(--text3)", textDecoration: "none" }}>Home</a>
              <span>/</span>
              <span style={{ color: "var(--text2)" }}>Comparisons</span>
            </nav>
            <h1 style={{ fontFamily: "var(--font-space)", fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 12px", color: "var(--text)" }}>
              AI Tool Comparisons
            </h1>
            <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
              In-depth head-to-head breakdowns to help you pick the right tool for your workflow.
            </p>
          </div>

          {comparisons.length === 0 ? (
            <div style={{ padding: "80px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 15, color: "var(--text3)" }}>No comparison articles published yet. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
              {comparisons.map((post) => (
                <ComparisonCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function ComparisonCard({ post }: { post: ComparisonPost }) {
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <Link href={`/compare/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <article style={{
        background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 18,
        overflow: "hidden", transition: "border-color 0.2s, transform 0.2s", height: "100%",
      }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--accent)"; el.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border2)"; el.style.transform = "none"; }}>

        {post.cover_image_url ? (
          <div style={{ aspectRatio: "16/7", overflow: "hidden" }}>
            <img src={post.cover_image_url} alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ) : (
          <div style={{ aspectRatio: "16/7", background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, var(--bg3)) 0%, var(--bg3) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-space)", fontSize: 28, fontWeight: 800, color: "var(--text3)", opacity: 0.4 }}>VS</span>
          </div>
        )}

        <div style={{ padding: "22px 24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 100, background: "color-mix(in srgb, var(--green) 15%, transparent)", border: "1px solid var(--green)", marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Comparison</span>
          </div>

          <h2 style={{ fontFamily: "var(--font-space)", fontSize: 19, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1.25, margin: "0 0 10px" }}>
            {post.title}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.65, margin: "0 0 20px" }}>{post.excerpt}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000", flexShrink: 0 }}>
                {post.author_initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{post.author_name}</div>
                {dateStr && <div style={{ fontSize: 11, color: "var(--text3)" }}>{dateStr}</div>}
              </div>
            </div>
            {post.read_time && (
              <span style={{ fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>{post.read_time} read</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
