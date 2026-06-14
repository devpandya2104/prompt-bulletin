import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPage from "@/components/BlogPage";
import type { BlogPost } from "@/lib/queries";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export const metadata = {
  title: "Blog — PromptBulletin",
  description: "Deep dives, roundups, and opinion from the PromptBulletin editorial team.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog — PromptBulletin",
    description: "Deep dives, roundups, and opinion from the PromptBulletin editorial team.",
    type: "website" as const,
    url: `${SITE_URL}/blog`,
    siteName: "PromptBulletin",
    locale: "en_US",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "PromptBulletin Blog" }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Blog — PromptBulletin",
    description: "Deep dives, roundups, and opinion from the PromptBulletin editorial team.",
    site: "@promptbulletin",
  },
};

const PER_PAGE = 9;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PER_PAGE;
  const to   = from + PER_PAGE - 1;

  const supabase = await createClient();
  const { data: posts, count } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, author_name, author_initials, category, read_time, cover_image_url, upvote_count, is_published, published_at", { count: "exact" })
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE);

  return (
    <>
      <Navbar />
      <BlogPage
        posts={(posts ?? []) as BlogPost[]}
        currentPage={page}
        totalPages={totalPages}
      />
      <Footer />
    </>
  );
}
