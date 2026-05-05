import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticlePage from "@/components/ArticlePage";
import ListiclePage from "@/components/ListiclePage";
import type { BlogPostDetail } from "@/lib/queries";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, seo_title, seo_description, seo_og_image")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return {};
  const title       = data.seo_title       ?? `${data.title} — PromptBulletin`;
  const description = data.seo_description ?? data.excerpt;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(data.seo_og_image ? { images: [{ url: data.seo_og_image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  const typedPost = post as BlogPostDetail;

  return (
    <>
      <Navbar />
      {typedPost.post_type === "listicle" ? (
        <ListiclePage post={typedPost} />
      ) : (
        <ArticlePage post={typedPost} />
      )}
      <Footer />
    </>
  );
}
