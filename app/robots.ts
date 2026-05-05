import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://promptbulletin.com");

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  let extraDisallow: string[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "seo_system")
      .single();
    if (data?.value?.noindexPaths) {
      extraDisallow = data.value.noindexPaths as string[];
    }
  } catch {
    // Table may not exist yet — safe to ignore
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/admin", ...extraDisallow],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
