import { createClient } from "@/lib/supabase/server";
import Navbar      from "@/components/Navbar";
import Hero        from "@/components/Hero";
import Categories  from "@/components/Categories";
import Discover    from "@/components/Discover";
import Features    from "@/components/Features";
import Blog        from "@/components/Blog";
import About       from "@/components/About";
import FAQ         from "@/components/FAQ";
import SubmitCTA   from "@/components/SubmitCTA";
import Newsletter  from "@/components/Newsletter";
import Footer      from "@/components/Footer";
import type { Category, Tool, BlogPost } from "@/lib/queries";

export const revalidate = 60; // re-fetch from DB every 60 seconds

async function getData() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: tools },
    { data: blogPosts },
  ] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("tools").select("*, categories(name, slug)").eq("is_published", true).order("upvote_count", { ascending: false }),
    supabase.from("blog_posts").select("id, title, slug, excerpt, author_name, author_initials, category, read_time, cover_image_url, upvote_count, published_at").eq("is_published", true).order("published_at", { ascending: false }).limit(3),
  ]);

  return {
    categories: (categories ?? []) as Category[],
    tools:      (tools      ?? []) as Tool[],
    blogPosts:  (blogPosts  ?? []) as BlogPost[],
  };
}

export default async function Home() {
  const { categories, tools, blogPosts } = await getData();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories categories={categories} />
        <Discover    tools={tools} categories={categories} />
        <Features />
        <Blog        posts={blogPosts} />
        <About />
        <FAQ />
        <SubmitCTA   categories={categories} />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
