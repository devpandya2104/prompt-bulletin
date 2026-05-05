import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://promptbulletin.com");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: tools }, { data: posts }, { data: categories }] = await Promise.all([
    supabase.from("tools").select("slug, updated_at").eq("is_published", true),
    supabase.from("blog_posts").select("slug, published_at").eq("is_published", true),
    supabase.from("categories").select("slug"),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,        lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const toolPages: MetadataRoute.Sitemap = (tools ?? []).map((t) => ({
    url: `${SITE_URL}/tools/${t.slug}`,
    lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...toolPages, ...blogPages];
}
