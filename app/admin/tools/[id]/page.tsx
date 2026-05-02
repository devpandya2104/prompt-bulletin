import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ToolEditor from "@/components/admin/ToolEditor";
import type { ToolDetail, ToolReview } from "@/lib/queries";

export const revalidate = 0;

export default async function AdminToolEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();

  const [{ data: tool }, { data: categories }, { data: reviews }] = await Promise.all([
    supabase.from("tools").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name, slug").order("sort_order"),
    supabase.from("tool_reviews").select("*").eq("tool_id", id).order("created_at", { ascending: false }),
  ]);

  if (!tool) notFound();

  return (
    <ToolEditor
      tool={tool as ToolDetail}
      categories={categories ?? []}
      reviews={(reviews ?? []) as ToolReview[]}
    />
  );
}
