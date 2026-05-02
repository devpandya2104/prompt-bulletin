import { createAdminClient } from "@/lib/supabase/server";
import ToolEditor from "@/components/admin/ToolEditor";

export const revalidate = 0;

export default async function AdminNewToolPage() {
  const supabase = await createAdminClient();
  const { data: categories } = await supabase.from("categories").select("id, name, slug").order("sort_order");

  return (
    <ToolEditor
      tool={null}
      categories={categories ?? []}
      reviews={[]}
    />
  );
}
