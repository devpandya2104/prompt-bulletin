import { createAdminClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/site-config-server";
import SEOPanel from "@/components/admin/SEOPanel";

export const revalidate = 0;

export default async function AdminSEOPage() {
  const [config, supabase] = await Promise.all([
    getSiteConfig(),
    createAdminClient(),
  ]);

  const [{ count: toolCount }, { count: blogCount }] = await Promise.all([
    supabase.from("tools").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("is_published", true),
  ]);

  return (
    <SEOPanel
      seoSystem={config.seo_system}
      toolCount={toolCount ?? 0}
      blogCount={blogCount ?? 0}
    />
  );
}
