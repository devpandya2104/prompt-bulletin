import { createAdminClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/site-config-server";
import SEOPanel from "@/components/admin/SEOPanel";

export const revalidate = 0;

export default async function AdminSEOPage() {
  const [config, supabase] = await Promise.all([
    getSiteConfig(),
    createAdminClient(),
  ]);

  const [
    { count: toolCount },
    { count: articleCount },
    { count: comparisonCount },
    { count: bestCount },
  ] = await Promise.all([
    supabase.from("tools").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("is_published", true).in("post_type", ["article", "listicle"]),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("is_published", true).eq("post_type", "comparison"),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("is_published", true).eq("post_type", "best"),
  ]);

  return (
    <SEOPanel
      seoSystem={config.seo_system}
      toolCount={toolCount ?? 0}
      articleCount={articleCount ?? 0}
      comparisonCount={comparisonCount ?? 0}
      bestCount={bestCount ?? 0}
    />
  );
}
