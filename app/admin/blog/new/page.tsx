import { createAdminClient } from "@/lib/supabase/server";
import BlogEditor from "@/components/admin/BlogEditor";
import type { Author } from "@/lib/queries";

export const revalidate = 0;

export default async function AdminBlogNewPage() {
  const supabase = createAdminClient();
  const { data: authors } = await supabase.from("authors").select("*").order("sort_order");
  return <BlogEditor post={null} authors={(authors ?? []) as Author[]} />;
}
