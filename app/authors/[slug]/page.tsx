import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/server";
import type { Author } from "@/lib/queries";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function getAuthorBySlug(slug: string) {
  const supabase = await createAdminClient();
  const { data } = await supabase.from("authors").select("*").order("sort_order");
  return (data ?? []).find((a: Author) => nameToSlug(a.name) === slug) as Author | undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};
  const canonicalUrl = `${SITE_URL}/authors/${slug}`;
  return {
    title: { absolute: `${author.name} — PromptBulletin` },
    description: author.bio ?? `${author.role} at PromptBulletin. Read their AI tool reviews and guides.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${author.name} — PromptBulletin`,
      description: author.bio ?? `${author.role} at PromptBulletin.`,
      type: "profile",
      url: canonicalUrl,
      siteName: "PromptBulletin",
      ...(author.avatar_url ? { images: [{ url: author.avatar_url, width: 400, height: 400, alt: author.name }] } : {}),
    },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const supabase = await createAdminClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, category, read_time, cover_image_url, published_at, post_type")
    .eq("is_published", true)
    .eq("author_name", author.name)
    .order("published_at", { ascending: false });

  const canonicalUrl = `${SITE_URL}/authors/${slug}`;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "jobTitle": author.role,
    "description": author.bio,
    "url": canonicalUrl,
    "worksFor": { "@type": "Organization", "name": "PromptBulletin", "url": SITE_URL },
    ...(author.avatar_url ? { "image": author.avatar_url } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-16">
        {/* Author card */}
        <div className="flex items-start gap-6 mb-12 pb-12 border-b border-[var(--border)]">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              width={96}
              height={96}
              className="rounded-full object-cover shrink-0"
              style={{ width: 96, height: 96 }}
            />
          ) : (
            <div
              className="rounded-full shrink-0 flex items-center justify-center text-2xl font-bold"
              style={{ width: 96, height: 96, background: "var(--accent-dim)", color: "var(--accent)", fontSize: 28 }}
            >
              {author.initials}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-1">{author.name}</h1>
            <p className="text-[var(--accent)] font-medium mb-4">{author.role}</p>
            {author.bio && (
              <p className="text-[var(--muted)] leading-relaxed">{author.bio}</p>
            )}
          </div>
        </div>

        {/* Published articles */}
        {posts && posts.length > 0 ? (
          <section>
            <h2 className="text-xl font-bold mb-6">
              Articles by {author.name}
              <span className="text-[var(--muted)] font-normal text-base ml-2">({posts.length})</span>
            </h2>
            <div className="flex flex-col gap-4">
              {posts.map((post) => {
                const pt = post.post_type ?? "article";
                const base = pt === "comparison" ? "compare" : pt === "best" ? "best" : "blog";
                return (
                  <Link
                    key={post.slug}
                    href={`/${base}/${post.slug}`}
                    className="block p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {post.category && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)]">
                          {post.category}
                        </span>
                      )}
                      {post.read_time && (
                        <span className="text-xs text-[var(--muted)]">{post.read_time} min read</span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1 leading-snug">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-[var(--muted)] line-clamp-2">{post.excerpt}</p>
                    )}
                    {post.published_at && (
                      <p className="text-xs text-[var(--muted)] mt-2">
                        {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <p className="text-[var(--muted)]">No published articles yet.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
