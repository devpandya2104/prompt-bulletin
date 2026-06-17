import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/admin/BlogEditor";
import type { BlogPostDetail, Author } from "@/lib/queries";

export const revalidate = 0;

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: post }, { data: authors }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).single(),
    supabase.from("authors").select("*").order("sort_order"),
  ]);
  if (!post) notFound();
  return <BlogEditor post={post as unknown as BlogPostDetail} authors={(authors ?? []) as Author[]} />;
}
