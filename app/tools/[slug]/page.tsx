import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolDetailPage from "@/components/ToolDetailPage";
import type { ToolDetail, ToolReview, Tool } from "@/lib/queries";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("tools")
    .select("name, tagline, description, seo_title, seo_description, seo_og_image, rating, review_count, categories(name)")
    .eq("slug", slug)
    .single();
  if (!data) return {};
  const title       = data.seo_title       ?? `${data.name} Review — PromptBulletin`;
  const description = data.seo_description ?? data.tagline ?? data.description;
  const canonicalUrl = `${SITE_URL}/tools/${slug}`;
  const ogImage = data.seo_og_image
    ? [{ url: data.seo_og_image, width: 1200, height: 630, alt: `${data.name} — PromptBulletin` }]
    : [{ url: "/og-default.png", width: 1200, height: 630, alt: `${data.name} — PromptBulletin` }];

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "website" as const,
      url: canonicalUrl,
      siteName: "PromptBulletin",
      locale: "en_US",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      site: "@promptbulletin",
      images: ogImage,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: tool }, { data: reviews }, { data: related }] = await Promise.all([
    supabase
      .from("tools")
      .select("*, categories(name, slug)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single(),
    supabase
      .from("tool_reviews")
      .select("*")
      .eq("tool_id", (
        await supabase.from("tools").select("id").eq("slug", slug).single()
      ).data?.id ?? "")
      .order("helpful_count", { ascending: false }),
    supabase
      .from("tools")
      .select("name, slug, rating, upvote_count, pricing, categories(name)")
      .eq("is_published", true)
      .neq("slug", slug)
      .limit(3),
  ]);

  if (!tool) notFound();

  const t = tool as ToolDetail & { website_url?: string; categories?: { name: string; slug: string } | null };
  const canonicalUrl = `${SITE_URL}/tools/${slug}`;

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.name,
    "url": t.website_url ?? canonicalUrl,
    "description": t.tagline ?? t.description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": t.platforms?.join(", ") || "Web",
    ...(t.pricing ? {
      "offers": {
        "@type": "Offer",
        "price": t.pricing.toLowerCase().includes("free") ? "0" : undefined,
        "priceCurrency": "USD",
        "description": t.pricing,
      },
    } : {}),
    ...(t.review_count > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": t.editor_rating ?? t.rating,
        "reviewCount": t.review_count,
        "bestRating": "5",
        "worstRating": "1",
      },
    } : {}),
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
        reviews={(reviews ?? []) as ToolReview[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        related={(related ?? []) as any}
      />
      <Footer />
    </>
  );
}
