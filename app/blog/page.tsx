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

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <>
      <Navbar />
      <BlogPage posts={(posts ?? []) as BlogPost[]} />
      <Footer />
    </>
  );
}
