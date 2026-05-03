import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BlogEditor from "@/components/admin/BlogEditor";
import type { BlogPostDetail } from "@/lib/queries";

export const revalidate = 0;

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!post) notFound();
  return <BlogEditor post={post as unknown as BlogPostDetail} />;
}
