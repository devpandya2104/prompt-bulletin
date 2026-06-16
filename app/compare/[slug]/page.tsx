import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComparisonPage from "@/components/ComparisonPage";
import type { BlogPostDetail, ComparisonData } from "@/lib/queries";
import type { Metadata } from "next";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

const getPost = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("post_type", "comparison")
    .eq("is_published", true)
    .single();
  return data;
});

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) return {};

  const post = data as BlogPostDetail & { seo_title?: string; seo_description?: string; seo_og_image?: string; canonical_url?: string };
  const titleStr    = post.seo_title       ?? `${post.title} — PromptBulletin`;
  const description = post.seo_description ?? post.excerpt;
  const canonicalUrl = post.canonical_url  ?? `${SITE_URL}/compare/${slug}`;
  const ogImage     = post.seo_og_image    ?? post.cover_image_url;
  const images = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }]
    : [{ url: "/og-default.png", width: 1200, height: 630, alt: post.title }];

  return {
    title: { absolute: titleStr }, description,
    alternates: { canonical: canonicalUrl },
    authors: post.author_name ? [{ name: post.author_name }] : undefined,
    openGraph: {
      title: titleStr, description, type: "article", url: canonicalUrl,
      siteName: "PromptBulletin", locale: "en_US", images,
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
      ...(post.author_name ? { authors: [post.author_name] } : {}),
    },
    twitter: { card: "summary_large_image", title: titleStr, description, site: "@promptbulletin", images },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const typedPost = post as BlogPostDetail;
  const canonicalUrl = `${SITE_URL}/compare/${slug}`;
  const comparisonData = (post as BlogPostDetail & { comparison_data?: ComparisonData | null }).comparison_data;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": typedPost.title,
    "description": typedPost.excerpt,
    "url": canonicalUrl,
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
    "author": { "@type": "Person", "name": typedPost.author_name },
    "publisher": { "@type": "Organization", "name": "PromptBulletin", "url": SITE_URL },
    ...(typedPost.published_at ? { "datePublished": typedPost.published_at } : {}),
    ...(typedPost.cover_image_url ? { "image": typedPost.cover_image_url } : {}),
    ...(typedPost.tags?.length ? { "keywords": typedPost.tags.join(", ") } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",        "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Comparisons", "item": `${SITE_URL}/compare` },
      { "@type": "ListItem", "position": 3, "name": typedPost.title, "item": canonicalUrl },
    ],
  };

  const faqSchema = comparisonData?.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": comparisonData.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": { "@type": "Answer", "text": faq.a },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <Navbar />
      <ComparisonPage post={typedPost} />
      <Footer />
    </>
  );
}
