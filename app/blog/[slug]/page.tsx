import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticlePage from "@/components/ArticlePage";
import ListiclePage from "@/components/ListiclePage";
import type { BlogPostDetail } from "@/lib/queries";
import type { Metadata } from "next";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, author_name, published_at, cover_image_url, seo_title, seo_description, seo_og_image")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return {};
  const title       = data.seo_title       ?? `${data.title} — PromptBulletin`;
  const description = data.seo_description ?? data.excerpt;
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;
  const ogImage = data.seo_og_image ?? data.cover_image_url;
  const images = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: data.title }]
    : [{ url: "/og-default.png", width: 1200, height: 630, alt: data.title }];

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    authors: data.author_name ? [{ name: data.author_name }] : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: "PromptBulletin",
      locale: "en_US",
      images,
      ...(data.published_at ? { publishedTime: data.published_at } : {}),
      ...(data.author_name ? { authors: [data.author_name] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@promptbulletin",
      images,
    },
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
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": typedPost.post_type === "listicle" ? "Article" : "BlogPosting",
    "headline": typedPost.title,
    "description": typedPost.excerpt,
    "url": canonicalUrl,
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
    "author": {
      "@type": "Person",
      "name": typedPost.author_name,
      ...(typedPost.author_role ? { "jobTitle": typedPost.author_role } : {}),
    },
    "publisher": {
      "@type": "Organization",
      "name": "PromptBulletin",
      "url": SITE_URL,
      "logo": { "@type": "ImageObject", "url": `${SITE_URL}/og-default.png` },
    },
    ...(typedPost.published_at ? { "datePublished": typedPost.published_at } : {}),
    ...(typedPost.cover_image_url ? { "image": typedPost.cover_image_url } : {}),
    ...(typedPost.tags?.length ? { "keywords": typedPost.tags.join(", ") } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
      { "@type": "ListItem", "position": 3, "name": typedPost.title, "item": canonicalUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
