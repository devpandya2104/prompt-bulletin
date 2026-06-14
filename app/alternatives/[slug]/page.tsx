import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AlternativesPage from "@/components/AlternativesPage";
import type { Metadata } from "next";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptbulletin.com";

const getRootTool = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tools")
    .select("id, name, slug, tagline, description, rating, pricing, pros, cons, category_id, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
});

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getRootTool(slug);
  if (!tool) return {};

  const title = `Best ${tool.name} Alternatives in 2026 — PromptBulletin`;
  const catName = (tool.categories as unknown as { name: string } | null)?.name ?? "AI";
  const description = `We compared the top ${catName} tools to find the best alternatives to ${tool.name}. See ratings, pricing, pros & cons.`;
  const canonicalUrl = `${SITE_URL}/alternatives/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title, description, type: "website", url: canonicalUrl,
      siteName: "PromptBulletin", locale: "en_US",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image", title, description,
      site: "@promptbulletin",
      images: ["/og-default.png"],
    },
  };
}

export default async function AlternativesRoutePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const rootTool = await getRootTool(slug);
  if (!rootTool) notFound();

  const supabase = await createClient();
  const { data: alternatives } = await supabase
    .from("tools")
    .select("id, name, slug, tagline, description, rating, pricing, pros, cons, categories(name, slug)")
    .eq("is_published", true)
    .eq("category_id", rootTool.category_id)
    .neq("slug", slug)
    .order("rating", { ascending: false })
    .limit(8);

  const canonicalUrl = `${SITE_URL}/alternatives/${slug}`;
  const title = `Best ${rootTool.name} Alternatives in 2026`;
  const categoryName = (rootTool.categories as unknown as { name: string } | null)?.name ?? "AI";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the best alternative to ${rootTool.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": (alternatives ?? [])[0]
            ? `${(alternatives ?? [])[0].name} is a top-rated alternative to ${rootTool.name} in the ${categoryName} category.`
            : `See our full comparison of ${categoryName} tools on PromptBulletin.`,
        },
      },
      {
        "@type": "Question",
        "name": `Is there a free alternative to ${rootTool.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": (() => {
            const free = (alternatives ?? []).filter((t) => t.pricing?.toLowerCase().includes("free"));
            return free.length > 0
              ? `${free.map((t) => t.name).join(", ")} ${free.length === 1 ? "offers" : "offer"} free tiers.`
              : `Most listed alternatives are paid. Check each tool's page for trial options.`;
          })(),
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",         "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Alternatives", "item": `${SITE_URL}/alternatives` },
      { "@type": "ListItem", "position": 3, "name": title,          "item": canonicalUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <AlternativesPage
        rootTool={rootTool as unknown as Parameters<typeof AlternativesPage>[0]["rootTool"]}
        alternatives={(alternatives ?? []) as unknown as Parameters<typeof AlternativesPage>[0]["alternatives"]}
      />
      <Footer />
    </>
  );
}
