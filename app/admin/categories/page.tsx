import { createAdminClient } from "@/lib/supabase/server";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = await createAdminClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, icon, description, sort_order")
    .order("sort_order");

  // Get tool counts per category
  const { data: toolCounts } = await supabase
    .from("tools")
    .select("category_id")
    .eq("is_published", true);

  const countMap: Record<string, number> = {};
  for (const t of toolCounts ?? []) {
    if (t.category_id) countMap[t.category_id] = (countMap[t.category_id] ?? 0) + 1;
  }

  const cats = (categories ?? []).map((c) => ({ ...c, tool_count: countMap[c.id] ?? 0 }));

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-space)", fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.03em" }}>
          Categories
        </h1>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: "4px 0 0" }}>
          {cats.length} categories · used across tools and blog posts
        </p>
      </div>
      <CategoriesManager categories={cats} />
    </div>
  );
}
