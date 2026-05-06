import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPage from "@/components/BlogPage";
import type { BlogPost } from "@/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Blog — PromptBulletin",
  description: "Deep dives, roundups, and opinion from the PromptBulletin editorial team.",
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
    .select("*", { count: "exact" })
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
