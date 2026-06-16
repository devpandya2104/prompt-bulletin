import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolDetailPage from "@/components/ToolDetailPage";
import type { ToolDetail, ToolReview, Tool } from "@/lib/queries";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

// Deduplicate — generateMetadata and the page both call this, React cache ensures one DB hit per request
const getTool = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tools")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getTool(slug);
  if (!data) return {};

  const t = data as ToolDetail & { seo_title?: string; seo_description?: string; seo_og_image?: string; canonical_url?: string };
  const year        = new Date().getFullYear();
  const titleStr    = t.seo_title       ?? `${t.name} Review (${year}) — PromptBulletin`;
  const description = t.seo_description ?? t.tagline ?? t.description;
  const canonicalUrl = t.canonical_url ?? `${SITE_URL}/tools/${slug}`;
  const ogImage = t.seo_og_image
    ? [{ url: t.seo_og_image, width: 1200, height: 630, alt: `${t.name} — PromptBulletin` }]
    : [{ url: "/og-default.png", width: 1200, height: 630, alt: `${t.name} — PromptBulletin` }];

  return {
    title: { absolute: titleStr },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: titleStr,
      description,
      type: "website" as const,
      url: canonicalUrl,
      siteName: "PromptBulletin",
      locale: "en_US",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: titleStr,
      description,
      site: "@promptbulletin",
      images: ogImage,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // getTool is cached — no second DB hit since generateMetadata already called it
  const tool = await getTool(slug);
  if (!tool) notFound();

  const supabase = await createClient();

  // Now fire reviews + related in true parallel using tool.id (no extra ID lookup)
  const [{ data: reviews }, { data: related }] = await Promise.all([
    supabase
      .from("tool_reviews")
      .select("*")
      .eq("tool_id", tool.id)
      .order("helpful_count", { ascending: false }),
    supabase
      .from("tools")
      .select("name, slug, rating, upvote_count, pricing, categories(name)")
      .eq("is_published", true)
      .neq("slug", slug)
      .limit(3),
  ]);

  const t = tool as ToolDetail & { website_url?: string; categories?: { name: string; slug: string } | null };
  const canonicalUrl = `${SITE_URL}/tools/${slug}`;
  const fetchedReviews = (reviews ?? []) as ToolReview[];

  // ── Editorial review from PromptBulletin ──────────────────────────────
  const editorRating5 = t.editor_rating ? parseFloat((t.editor_rating / 2).toFixed(1)) : null;

  const editorialReview = editorRating5 && editorRating5 >= 1 ? {
    "@type": "Review",
    "author": { "@type": "Organization", "name": "PromptBulletin", "url": SITE_URL },
    "datePublished": (t as { updated_at?: string | null }).updated_at
      ? new Date((t as { updated_at: string }).updated_at).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": String(editorRating5),
      "bestRating": "5",
      "worstRating": "1",
    },
    "reviewBody": t.summary ?? t.description,
    ...(t.pros?.length ? {
      "positiveNotes": {
        "@type": "ItemList",
        "itemListElement": t.pros.slice(0, 6).map((name, i) => ({ "@type": "ListItem", "position": i + 1, name })),
      },
    } : {}),
    ...(t.cons?.length ? {
      "negativeNotes": {
        "@type": "ItemList",
        "itemListElement": t.cons.slice(0, 6).map((name, i) => ({ "@type": "ListItem", "position": i + 1, name })),
      },
    } : {}),
  } : null;

  // ── User reviews (up to 5 most helpful) ──────────────────────────────
  const userReviews = fetchedReviews.slice(0, 5).map((r) => ({
    "@type": "Review",
    "author": { "@type": "Person", "name": r.author_name },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": String(r.rating),
      "bestRating": "5",
      "worstRating": "1",
    },
    "reviewBody": r.review_text,
  }));

  const allReviews = [...(editorialReview ? [editorialReview] : []), ...userReviews];

  // ── Aggregate rating (editor + users combined) ────────────────────────
  const totalCount = fetchedReviews.length + (editorialReview ? 1 : 0);
  const ratingSum = fetchedReviews.reduce((s, r) => s + r.rating, editorRating5 ?? 0);
  const avgRating = totalCount > 0
    ? parseFloat((ratingSum / totalCount).toFixed(1))
    : (t.rating ?? 0);

  // ── Full schema ───────────────────────────────────────────────────────
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.name,
    "url": t.website_url ?? canonicalUrl,
    "description": t.tagline ?? t.description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": t.platforms?.join(", ") || "Web",
    ...(t.logo_url ? { "image": t.logo_url } : {}),
    ...(t.company ? { "author": { "@type": "Organization", "name": t.company } } : {}),
    ...(t.pricing ? {
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        ...(t.pricing.toLowerCase().includes("free") ? { "price": "0" } : {}),
        "description": t.pricing,
      },
    } : {}),
    ...(totalCount > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(avgRating),
        "reviewCount": String(totalCount),
        "bestRating": "5",
        "worstRating": "1",
      },
    } : {}),
    ...(allReviews.length > 0 ? { "review": allReviews } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Discover Tools", "item": `${SITE_URL}/#discover` },
      ...(t.categories?.name ? [{ "@type": "ListItem", "position": 3, "name": t.categories.name, "item": `${SITE_URL}/#discover` }] : []),
      { "@type": "ListItem", "position": t.categories?.name ? 4 : 3, "name": t.name, "item": canonicalUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <ToolDetailPage
        tool={t as ToolDetail}
        reviews={fetchedReviews}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        related={(related ?? []) as any}
      />
      <Footer />
    </>
  );
}
